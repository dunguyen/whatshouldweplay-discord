module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module"
    },
    env: {
        "browser": true,
        "es6": true,
        "node": true
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'airbnb-typescript',
        'eslint:recommended',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:node/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "prettier",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
    ]
};