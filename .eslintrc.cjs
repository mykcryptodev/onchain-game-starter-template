/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint",
    "react-hooks",
    "simple-import-sort"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "ignorePatterns": ["solidity/*"],
  "rules": {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": {
          "attributes": false
        }
      }
    ],
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "simple-import-sort/imports": [
      "warn",
      {
        "groups": [
          // Keep CSS imports as they are
          ["^\\u0000"],
          // Packages
          ["^@?\\w"],
          // Absolute imports and other imports such as styles
          ["^"],
          // Relative imports
          ["^\\."],
          // Style imports
          ["^.+\\.s?css$"]
        ]
      }
    ]
  }
}
module.exports = config;