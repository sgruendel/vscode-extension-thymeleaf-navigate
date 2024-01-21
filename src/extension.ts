import * as vscode from 'vscode';
import { ThymeleafFragmentLinkProvider } from './provider';

const TH_NAVIGATE = 'thymeleaf-navigate';

// export for testing
export let thFragmentLinkProvider: ThymeleafFragmentLinkProvider | null = null;
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
    console.log('ThymeleafFragmentLinkProvider activate()');
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
}

export function deactivate() {
    console.log('ThymeleafFragmentLinkProvider deactivate()');
    disposeSubscriptionAndProvider();
}

function disposeSubscriptionAndProvider() {
    if (thFragmentLinkProviderSubscription) {
        thFragmentLinkProviderSubscription.dispose();
    }
    if (thFragmentLinkProvider) {
        thFragmentLinkProvider.dispose();
    }
}

function registerLinkProvider(context: vscode.ExtensionContext) {
    disposeSubscriptionAndProvider();

    thFragmentLinkProvider = new ThymeleafFragmentLinkProvider();
    thFragmentLinkProviderSubscription = vscode.languages.registerDocumentLinkProvider(
        { scheme: 'file', language: getThymeleafLanguage() },
        thFragmentLinkProvider,
    );
    context.subscriptions.push(thFragmentLinkProviderSubscription);
}
