import * as vscode from 'vscode';

export default class ThymeleafDocumentLink extends vscode.DocumentLink {
    templatePath: string;
    fragmentName: string;

    constructor(range: vscode.Range, templatePath: string, fragmentName: string) {
        super(range);
        this.templatePath = templatePath;
        this.fragmentName = fragmentName;
    }
}
