import * as vscode from 'vscode';
import ThymeleafFragmentLinkProvider from './provider';

const TH_NAVIGATE = 'thymeleaf-navigate';

let thFragmentLinkProvider: ThymeleafFragmentLinkProvider | null = null;
let thFragmentLinkProviderSubscription: vscode.Disposable | null = null;

export function getThymeleafLanguage(): string {
    const config = vscode.workspace.getConfiguration(TH_NAVIGATE);
    return config.get<string>('language', 'html');
}

export function getThymeleafFragmentsPath(): string {
    const config = vscode.workspace.getConfiguration(TH_NAVIGATE);
    return config.get<string>('fragmentsPath', 'src/main/resources/templates');
}

export function activate(context: vscode.ExtensionContext) {
    console.log('ThymeleafFragmentLinkProvider activate() init');
    registerLinkProvider(context);

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            thFragmentLinkProvider?.handleDocumentChange(event);
        }),
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(TH_NAVIGATE)) {
                registerLinkProvider(context);
            }
        }),
    );

    console.log('ThymeleafFragmentLinkProvider activate() done');
}

export function deactivate() {
    console.log('ThymeleafFragmentLinkProvider deactivate()');
    if (thFragmentLinkProvider) {
        thFragmentLinkProvider.dispose();
    }
    if (thFragmentLinkProviderSubscription) {
        thFragmentLinkProviderSubscription.dispose();
    }
}

function registerLinkProvider(context: vscode.ExtensionContext) {
    console.log('registerLinkProvider(), current subscription:', thFragmentLinkProviderSubscription);
    if (thFragmentLinkProvider) {
        console.log('disposing provider');
        // Dispose of the current provider before registering a new one
        thFragmentLinkProvider.dispose();
    }
    if (thFragmentLinkProviderSubscription) {
        console.log('disposing subscription');
        // Dispose of the current provider before registering a new one
        thFragmentLinkProviderSubscription.dispose();
    }

    thFragmentLinkProvider = new ThymeleafFragmentLinkProvider();
    thFragmentLinkProviderSubscription = vscode.languages.registerDocumentLinkProvider(
        { scheme: 'file', language: getThymeleafLanguage() },
        thFragmentLinkProvider,
    );
    context.subscriptions.push(thFragmentLinkProviderSubscription);
}
