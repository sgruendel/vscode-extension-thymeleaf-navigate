import { defineConfig } from '@vscode/test-cli';
import { tmpdir } from 'os';
import path from 'path';

const workspaceFolder = path.resolve('src/test/workspace-html');
const userDataDir = path.join(tmpdir(), 'vscode-thymeleaf-navigate-test-user-data');

export default defineConfig([
    {
        label: 'HTML Unit Tests',
        files: 'out/test/**/*.test-html.js',
        version: 'insiders',
        launchArgs: [workspaceFolder, `--user-data-dir=${userDataDir}`],
        mocha: {
            ui: 'tdd',
            timeout: 20000,
        },
    },
]);
