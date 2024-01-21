import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
    {
        label: 'HTML Unit Tests',
        files: 'out/test/**/*.test-html.js',
        version: 'insiders',
        workspaceFolder: 'src/test/workspace-html',
        mocha: {
            ui: 'tdd',
            timeout: 20000,
        },
    },
]);
