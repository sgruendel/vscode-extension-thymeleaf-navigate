import * as vscode from 'vscode';
import ThymeleafFragmentLinkProvider from './provider';

export function activate(context: vscode.ExtensionContext) {
    console.log('ThymeleafFragmentLinkProvider activate() init');
    const thymeleafFragmentLinkProvider = new ThymeleafFragmentLinkProvider();

    // Register the document change event listener
    const changeDocumentListener = vscode.workspace.onDidChangeTextDocument(
        thymeleafFragmentLinkProvider.handleDocumentChange.bind(thymeleafFragmentLinkProvider),
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            { language: ThymeleafFragmentLinkProvider.language },
            thymeleafFragmentLinkProvider,
        ),
        changeDocumentListener,
    );

    console.log('ThymeleafFragmentLinkProvider activate() done');
}

export function deactivate() {
    console.log('ThymeleafFragmentLinkProvider deactivate()');
}
