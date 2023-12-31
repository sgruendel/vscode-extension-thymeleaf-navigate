import * as vscode from 'vscode';
import * as path from 'path';
import ThymeleafDocumentLink from './thdocumentlink';

export default class ThymeleafFragmentLinkProvider implements vscode.DocumentLinkProvider {

    // currently we're only supporting Thymeleaf in HTML
    static language = 'html';

    // RegExp defining a Thymeleaf fragment e.g. <div th:fragment="card-skeleton">
    static thymeleafFragmentRegex: RegExp = /th:fragment *= *" *([\w-]+) *(\(.*\))? *"/g;

    // RegExp defining a Thymeleaf link e.g. <div th:replace="~{fragments/skeletons :: card-skeleton}" />
    static thymeleafLinkRegex: RegExp = /th:(replace|insert) *= *" *~{ *([\w-/]+)? *:: *([\w-]+).*}"/g;

    // Map of links to all Thymeleaf fragments in a document, key is documents fs path
    private _thLinks = new Map<string, vscode.DocumentLink[]>();

    // Map of Uris (including line number) for all all Thymeleaf fragments known so far, key is documents fs path + '::' + fragment name
    private _thUris = new Map<string, vscode.Uri>();

    // Set of fs paths of all documents marked as changed before (re-)parsing
    private _changedDocuments = new Set<string>();

    constructor() {
        console.info('constructor()');
    }

    dispose() {
        console.info('disposing');
        this._thLinks.clear();
        this._thUris.clear();
        this._changedDocuments.clear();
    }

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken,
    ): vscode.DocumentLink[] | undefined {
        if (this._changedDocuments.has(document.uri.fsPath)) {
            console.log('changed since last time, reparsing: ' + document.uri.fsPath);
            // no need to clear _thLinks, will be overwritten below
            this.clearThUrisFor(document.uri.fsPath);
            this._changedDocuments.delete(document.uri.fsPath);
        } else {
            const cachedLinks = this._thLinks.get(document.uri.fsPath);
            if (cachedLinks) {
                // document already parsed and cached
                console.log('already parsed: ' + document.uri.fsPath);
                return cachedLinks;
            } else {
                console.log('initial parsing: ' + document.uri.fsPath);
            }
        }

        let links = [];
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
            // first find all th:fragments created in this document
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const matches = line.text.matchAll(ThymeleafFragmentLinkProvider.thymeleafFragmentRegex);

                try {
                    for (const match of matches) {
                        if (match.index !== undefined) {
                            const fragmentName = match[1];
                            console.log(
                                document.uri.fsPath.substring(document.uri.fsPath.lastIndexOf('/') + 1) +
                                    ':' +
                                    i +
                                    ': match fragment definition "' +
                                    fragmentName +
                                    '"',
                            );

                            // set line number as string as fragment, so VSCode will directly go to that line
                            const uri = document.uri.with({
                                fragment: (line.lineNumber + 1).toString(),
                            });
                            this._thUris.set(document.uri.fsPath + '::' + fragmentName, uri);
                        }
                    }
                } catch (err) {
                    console.error('error in ' + document.uri + ':' + i, err);
                }
            }

            // get the extension of the current file, assumes thymeleaf fragments referenced will have the same extension
            const ext = getDocumentExt(document);

            // now create links for all Thymeleaf references in this document
            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const matches = line.text.matchAll(ThymeleafFragmentLinkProvider.thymeleafLinkRegex);

                try {
                    for (const match of matches) {
                        if (match.index !== undefined) {
                            // match[2] is undefined e.g. "~{::fragmentname}" => normalize templatename to "this"
                            // match[2] is defined e.g. "~{dir/templatename::fragmentname}" => normalize templatename to templatename.ext
                            const templateName = match[2] ? match[2] + ext : 'this';
                            const fragmentName = match[3];
                            console.log(
                                document.uri.fsPath.substring(document.uri.fsPath.lastIndexOf('/') + 1) +
                                    ':' +
                                    i +
                                    ': match fragment link "' +
                                    fragmentName +
                                    '" in ' +
                                    templateName,
                            );

                            const range = new vscode.Range(
                                i,
                                match.index + match[0].indexOf('{') + 1,
                                i,
                                match.index + match[0].indexOf('}'),
                            );

                            if (templateName === 'this') {
                                // referencing current document, this should exist
                                const thUri = this._thUris.get(document.uri.fsPath + '::' + fragmentName);
                                if (thUri) {
                                    links.push(new vscode.DocumentLink(range, thUri));
                                } else {
                                    // could be a typo or is not defined yet
                                    console.error('local fragment not found: "' + fragmentName + '"');
                                }
                            } else {
                                // referencing other document, this could already exist or not
                                const templatePath = path.join(
                                    (vscode.workspace.workspaceFolders &&
                                        vscode.workspace.workspaceFolders[0].uri.fsPath) ||
                                        '',
                                    'src/main/resources/templates',
                                    templateName,
                                );
                                const thUri = this._thUris.get(templatePath + '::' + fragmentName);
                                if (thUri) {
                                    links.push(new vscode.DocumentLink(range, thUri));
                                } else {
                                    // create link that will be resolved in resolveDocumentLink()
                                    links.push(new ThymeleafDocumentLink(range, templatePath, fragmentName));
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('error in ' + document.uri + ':' + i, err);
                }
            }
            this._thLinks.set(document.uri.fsPath, links);
        }

        return links;
    }

    resolveDocumentLink(link: vscode.DocumentLink, token: vscode.CancellationToken): vscode.DocumentLink {
        if (link instanceof ThymeleafDocumentLink) {
            const thLink = link as ThymeleafDocumentLink;
            const thUri = this._thUris.get(thLink.templatePath + '::' + thLink.fragmentName);
            if (thUri) {
                // we can fully resolve it now
                return new vscode.DocumentLink(thLink.range, thUri);
            }
            console.log('not resolved yet: ' + thLink.templatePath + '::' + thLink.fragmentName);
            // we can't resolve it yet with a line number, just return link to file, it will be properly parsed on loading
            return new vscode.DocumentLink(thLink.range, vscode.Uri.file(thLink.templatePath));
        }
        return link;
    }

    handleDocumentChange(event: vscode.TextDocumentChangeEvent) {
        if (getDocumentExt(event.document) === '.' + ThymeleafFragmentLinkProvider.language) {
            console.log('marking document as changed: ' + event.document.uri.fsPath);
            this._changedDocuments.add(event.document.uri.fsPath);
        }
    }

    clearThUrisFor(documentFsPath: string) {
        const uriKeysToDelete = [];
        for (const key of this._thUris.keys()) {
            if (key.startsWith(documentFsPath + '::')) {
                uriKeysToDelete.push(key);
            }
        }
        for (const key of uriKeysToDelete) {
            this._thUris.delete(key);
        }
        console.log('deleted uris for changed document: ' + uriKeysToDelete.length);
    }
}

function getDocumentExt(document: vscode.TextDocument): string {
    const extIndex = document.uri.fsPath.lastIndexOf('.');
    return document.uri.fsPath.substring(extIndex);
}
