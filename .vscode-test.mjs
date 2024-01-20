import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
    {
        label: 'unitTests',
        files: 'out/test/**/*.test.js',
        version: 'insiders',
        workspaceFolder: 'src/test/workspace',
        mocha: {
            ui: 'tdd',
            timeout: 20000,
        },
    },
]);
