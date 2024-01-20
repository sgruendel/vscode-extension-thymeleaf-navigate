import * as assert from 'assert';
import { after, suite, test } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as thExt from '../extension';

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
        const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file('./file1.html'));
        console.log('fileStat', fileStat);
        console.log('wsf:', vscode.workspace.workspaceFile);
        await vscode.workspace.findFiles('**/*').then((files) => {
            files.forEach((file) => {
                console.log('file.fsPath:' + file.fsPath);
            });
        });
        console.log('thflp', thFragmentLinkProvider);
    });
});
