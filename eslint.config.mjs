import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/out", "**/dist", "**/*.d.ts"]), {
    extends: compat.extends("strongloop"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],

        "@/semi": "warn",
        curly: "warn",
        eqeqeq: "warn",
        indent: ["warn", 4],

        "max-len": ["warn", 120, 4, {
            ignoreComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignorePattern: "^\\s*var\\s.+=\\s*(require\\s*\\()|(/)",
        }],

        "no-throw-literal": "warn",
        semi: "off",
        "space-before-function-paren": 0,
    },
}]);