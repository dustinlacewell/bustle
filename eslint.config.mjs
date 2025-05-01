import jsLint from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"
import tsLint from "typescript-eslint"

export default [
    ...tsLint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["*.js", "*.mjs"]
                },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    jsLint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
            stylistic
        },
        rules: {
            "indent": ["error", 4],
            "no-unused-vars": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/naming-convention": ["error",
                { selector: "class", format: ["PascalCase"] },
                { selector: "method", format: ["camelCase"] },
                { selector: "function", format: ["camelCase"], leadingUnderscore: "allow" },
                { selector: "variable", format: ["camelCase"], leadingUnderscore: "allow" },
                { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
                { selector: "classProperty", format: ["camelCase"] },
                { selector: "enum", format: ["PascalCase"] },
                { selector: "enumMember", format: ["PascalCase"] },
                { selector: "typeAlias", format: ["PascalCase"] },
                { selector: "interface", format: ["PascalCase"] }
            ]
        }
    },
    // config parsers
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"]
    },
    {
        ignores: [
            "node_modules",
            "**/node_modules"
        ]
    },
    // syntax rules
    // code style rules
    stylistic.configs["disable-legacy"],
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: false,
        commaDangle: "never",
        jsx: true
    }),
    {
        files: [
            "src/lib/steam/steam-api.ts",
            "src/lib/steam/workshop-uploader.ts"
        ],
        rules: {
            // Example: turn off no-explicit-any for this file
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off"
            // Add any other rule overrides here
        }
    }
]
