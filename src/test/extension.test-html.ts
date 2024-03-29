import * as assert from 'assert';
import { after, suite, test } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as thExt from '../extension';
import { ThymeleafDocumentLink } from '../provider';

class MockCancellationToken implements vscode.CancellationToken {
    isCancellationRequested: boolean = false;

    onCancellationRequested: vscode.Event<any> = new vscode.EventEmitter<any>().event;
}

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    after(() => {
        vscode.window.showInformationMessage('All tests done!');
    });

    test('extension getThymeleafLanguage()', () => {
        assert.strictEqual(thExt.getThymeleafLanguage(), 'html', 'should default to html');
    });

    test('extension getThymeleafFragmentsPath()', () => {
        assert.strictEqual(
            thExt.getThymeleafFragmentsPath(),
            'src/main/resources/templates',
            'should default to src/main/resources/templates',
        );
    });

    test('provider HTML provideDocumentLinks() / resolveDocumentLink()', async () => {
        let files = await vscode.workspace.findFiles('**/file1.html');
        assert.equal(files.length, 1);
        console.log('file.fsPath:' + files[0].fsPath);

        const doc = await vscode.workspace.openTextDocument(files[0]);
        assert.equal(doc.languageId, 'html');

        const thFragmentLinkProvider = thExt.thFragmentLinkProvider;
        assert.ok(thFragmentLinkProvider);
        const cancellationToken = new MockCancellationToken();

        const thLinks = thFragmentLinkProvider.provideDocumentLinks(doc, cancellationToken);
        console.log('thLinks:', thLinks);
        assert.ok(thLinks);
        assert.equal(thLinks.length, 14);

        // ==============================
        // <div th:replace="~{fragments/file}">
        // ==============================
        assert.equal(getFileName(thLinks[0].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[0].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[0] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[0] as vscode.DocumentLink, cancellationToken),
            thLinks[0],
        );

        // ==============================
        // <div th:insert="~{fragments/file}">
        // ==============================
        assert.equal(getFileName(thLinks[1].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[1].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[1] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[1] as vscode.DocumentLink, cancellationToken),
            thLinks[1],
        );

        // ==============================
        // <div th:replace="~{:: local}">
        // ==============================
        assert.equal(getFileName(thLinks[2].target?.fsPath), 'file1.html');
        assert.equal(thLinks[2].target?.fragment, '6');
        assert.equal(thLinks[2].tooltip, 'Thymeleaf Fragment "local" [file1.html]');
        // local links are resolved directly
        assert.ok(thLinks[2] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[2] as vscode.DocumentLink, cancellationToken),
            thLinks[2],
        );

        // ==============================
        // <div th:insert="~{:: local}">
        // ==============================
        assert.equal(getFileName(thLinks[3].target?.fsPath), 'file1.html');
        assert.equal(thLinks[3].target?.fragment, '6');
        assert.equal(thLinks[3].tooltip, 'Thymeleaf Fragment "local" [file1.html]');
        // local links are resolved directly
        assert.ok(thLinks[3] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[3] as vscode.DocumentLink, cancellationToken),
            thLinks[3],
        );

        // ==============================
        // <div th:replace="~{this :: local}">
        // ==============================
        assert.equal(getFileName(thLinks[4].target?.fsPath), 'file1.html');
        assert.equal(thLinks[4].target?.fragment, '6');
        assert.equal(thLinks[4].tooltip, 'Thymeleaf Fragment "local" [file1.html]');
        // local links are resolved directly
        assert.ok(thLinks[4] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[4] as vscode.DocumentLink, cancellationToken),
            thLinks[4],
        );

        // ==============================
        // <div th:insert="~{this :: local}">
        // ==============================
        assert.equal(getFileName(thLinks[5].target?.fsPath), 'file1.html');
        assert.equal(thLinks[5].target?.fragment, '6');
        assert.equal(thLinks[5].tooltip, 'Thymeleaf Fragment "local" [file1.html]');
        // local links are resolved directly
        assert.ok(thLinks[5] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[5] as vscode.DocumentLink, cancellationToken),
            thLinks[5],
        );

        // ==============================
        // <div th:replace="~{fragments/file :: extern1}">
        // ==============================
        assert.equal(getFileName(thLinks[6].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[6].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[6] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[6] as vscode.DocumentLink, cancellationToken),
            thLinks[6],
        );

        assert.ok(thLinks[7] instanceof ThymeleafDocumentLink);
        let thLink = thLinks[7] as ThymeleafDocumentLink;
        assert.equal(getFileName(thLink.templatePath), 'fragments/file.html');
        assert.equal(thLink.fragmentName, 'extern1');
        assert.equal(thLink.tooltip, 'Thymeleaf Fragment "extern1" [file.html]');
        // external links are resolved later
        assert.ok(thFragmentLinkProvider.resolveDocumentLink(thLink, cancellationToken) instanceof vscode.DocumentLink);

        // ==============================
        // <div th:insert="~{fragments/file :: extern2}">
        // ==============================
        assert.equal(getFileName(thLinks[8].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[8].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[8] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[8] as vscode.DocumentLink, cancellationToken),
            thLinks[8],
        );

        assert.ok(thLinks[9] instanceof ThymeleafDocumentLink);
        thLink = thLinks[9] as ThymeleafDocumentLink;
        assert.equal(getFileName(thLink.templatePath), 'fragments/file.html');
        assert.equal(thLink.fragmentName, 'extern2');
        assert.equal(thLink.tooltip, 'Thymeleaf Fragment "extern2" [file.html]');
        // external links are resolved later
        assert.ok(thFragmentLinkProvider.resolveDocumentLink(thLink, cancellationToken) instanceof vscode.DocumentLink);

        // ==============================
        // th:replace="~{fragments/file :: extern1(
        // ==============================
        assert.equal(getFileName(thLinks[10].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[10].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[10] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[10] as vscode.DocumentLink, cancellationToken),
            thLinks[10],
        );

        assert.ok(thLinks[11] instanceof ThymeleafDocumentLink);
        thLink = thLinks[11] as ThymeleafDocumentLink;
        assert.equal(getFileName(thLink.templatePath), 'fragments/file.html');
        assert.equal(thLink.fragmentName, 'extern1');
        assert.equal(thLink.tooltip, 'Thymeleaf Fragment "extern1" [file.html]');
        // external links are resolved later
        assert.ok(thFragmentLinkProvider.resolveDocumentLink(thLink, cancellationToken) instanceof vscode.DocumentLink);

        // ==============================
        // th:insert="~{fragments/file :: extern2(
        // ==============================
        assert.equal(getFileName(thLinks[12].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[12].tooltip, 'fragments/file.html');
        // file links are resolved directly
        assert.ok(thLinks[12] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider.resolveDocumentLink(thLinks[12] as vscode.DocumentLink, cancellationToken),
            thLinks[12],
        );

        assert.ok(thLinks[13] instanceof ThymeleafDocumentLink);
        thLink = thLinks[13] as ThymeleafDocumentLink;
        assert.equal(getFileName(thLink.templatePath), 'fragments/file.html');
        assert.equal(thLink.fragmentName, 'extern2');
        assert.equal(thLink.tooltip, 'Thymeleaf Fragment "extern2" [file.html]');
        // external links are resolved later
        assert.ok(thFragmentLinkProvider.resolveDocumentLink(thLink, cancellationToken) instanceof vscode.DocumentLink);

        console.log('thflp', thFragmentLinkProvider);
    });
});

function getFileName(fsPath: string | undefined): string | undefined {
    if (!fsPath) {
        return fsPath;
    }
    const slash = fsPath.lastIndexOf('/src/main/resources/templates/');
    return fsPath.substring(slash + 30);
}
