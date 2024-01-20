import * as assert from 'assert';
import { after, suite, test } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as thExt from '../extension';

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

    test('provider x()', async () => {
        const thFragmentLinkProvider = thExt.thFragmentLinkProvider;
        const ct = new MockCancellationToken();

        let files = await vscode.workspace.findFiles('**/file1.html');
        assert.equal(files.length, 1);
        console.log('file.fsPath:' + files[0].fsPath);
        let doc = await vscode.workspace.openTextDocument(files[0]);
        console.log('doc:' + doc.languageId);
        const thLinks = thFragmentLinkProvider?.provideDocumentLinks(doc, ct);
        console.log('thLinks:', thLinks);

        console.log('thflp', thFragmentLinkProvider);
    });
});
