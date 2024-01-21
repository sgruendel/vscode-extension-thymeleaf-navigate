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
        const thFragmentLinkProvider = thExt.thFragmentLinkProvider;
        const cancellationToken = new MockCancellationToken();

        let files = await vscode.workspace.findFiles('**/file1.html');
        assert.equal(files.length, 1);
        console.log('file.fsPath:' + files[0].fsPath);

        const doc = await vscode.workspace.openTextDocument(files[0]);
        assert.equal(doc.languageId, 'html');

        const thLinks = thFragmentLinkProvider?.provideDocumentLinks(doc, cancellationToken);
        console.log('thLinks:', thLinks);
        assert.ok(thLinks);
        assert.equal(thLinks.length, 12);

        // <div th:replace="~{:: local}">
        assert.equal(getFileName(thLinks[0].target?.fsPath), 'file1.html');
        assert.equal(thLinks[0].target?.fragment, '6');
        assert.equal(thLinks[0].tooltip, 'Thymeleaf Fragment "local" [file1.html]');
        // local links are resolved directly
        assert.ok(thLinks[0] instanceof vscode.DocumentLink);
        assert.equal(
            thFragmentLinkProvider?.resolveDocumentLink(thLinks[0] as vscode.DocumentLink, cancellationToken),
            thLinks[0],
        );

        // <div th:insert="~{:: local}">
        assert.equal(getFileName(thLinks[1].target?.fsPath), 'file1.html');
        assert.equal(thLinks[1].target?.fragment, '6');
        assert.equal(thLinks[1].tooltip, 'Thymeleaf Fragment "local" [file1.html]');

        // <div th:replace="~{this :: local}">
        assert.equal(getFileName(thLinks[2].target?.fsPath), 'file1.html');
        assert.equal(thLinks[2].target?.fragment, '6');
        assert.equal(thLinks[2].tooltip, 'Thymeleaf Fragment "local" [file1.html]');

        // <div th:insert="~{this :: local}">
        assert.equal(getFileName(thLinks[3].target?.fsPath), 'file1.html');
        assert.equal(thLinks[3].target?.fragment, '6');
        assert.equal(thLinks[3].tooltip, 'Thymeleaf Fragment "local" [file1.html]');

        // <div th:replace="~{fragments/file :: extern1}">
        assert.equal(getFileName(thLinks[4].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[4].tooltip, 'fragments/file.html');
        assert.equal(getFileName((thLinks[5] as ThymeleafDocumentLink).templatePath), 'fragments/file.html');
        assert.equal((thLinks[5] as ThymeleafDocumentLink).fragmentName, 'extern1');
        assert.equal(thLinks[5].tooltip, 'Thymeleaf Fragment "extern1" [file.html]');

        // <div th:insert="~{fragments/file :: extern2}">
        assert.equal(getFileName(thLinks[6].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[6].tooltip, 'fragments/file.html');
        assert.equal(getFileName((thLinks[7] as ThymeleafDocumentLink).templatePath), 'fragments/file.html');
        assert.equal((thLinks[7] as ThymeleafDocumentLink).fragmentName, 'extern2');
        assert.equal(thLinks[7].tooltip, 'Thymeleaf Fragment "extern2" [file.html]');

        // th:replace="~{fragments/file :: extern1(
        assert.equal(getFileName(thLinks[8].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[8].tooltip, 'fragments/file.html');
        assert.equal(getFileName((thLinks[9] as ThymeleafDocumentLink).templatePath), 'fragments/file.html');
        assert.equal((thLinks[9] as ThymeleafDocumentLink).fragmentName, 'extern1');
        assert.equal(thLinks[9].tooltip, 'Thymeleaf Fragment "extern1" [file.html]');

        // th:insert="~{fragments/file :: extern2(
        assert.equal(getFileName(thLinks[10].target?.fsPath), 'fragments/file.html');
        assert.equal(thLinks[10].tooltip, 'fragments/file.html');
        assert.equal(getFileName((thLinks[11] as ThymeleafDocumentLink).templatePath), 'fragments/file.html');
        assert.equal((thLinks[11] as ThymeleafDocumentLink).fragmentName, 'extern2');
        assert.equal(thLinks[11].tooltip, 'Thymeleaf Fragment "extern2" [file.html]');

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
