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
        const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file('.'));
        console.log('fileStat', fileStat);
        let docs: vscode.TextEditor[] = [];
        await vscode.workspace.findFiles('**/*.html').then((files) => {
            files.forEach(async (file) => {
                console.log('file.fsPath:' + file.fsPath);
                let doc = await vscode.workspace.openTextDocument(file);
                console.log('doc:' + doc.languageId);
                docs.push(await vscode.window.showTextDocument(doc));
            });
        });
        console.log('docs', docs);
        console.log('await', await Promise.all(docs));
        console.log('thflp', thFragmentLinkProvider);
    });
});
