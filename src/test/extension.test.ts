import * as assert from 'assert';
import { suite, test } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as thExt from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('getThymeleafLanguage()', () => {
        assert.strictEqual(thExt.getThymeleafLanguage(), 'html');
    });

    test('getThymeleafFragmentsPath()', () => {
        assert.strictEqual(thExt.getThymeleafFragmentsPath(), 'src/main/resources/templates');
    });
});
