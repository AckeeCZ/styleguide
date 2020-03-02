module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "sonarjs"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "standard-with-typescript",
    "plugin:sonarjs/recommended"
  ],
  parserOptions: {
    project: "./tsconfig.json"
  },
  rules: {
    "@typescript-eslint/strict-boolean-expressions": 0,
    "@typescript-eslint/promise-function-async": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/restrict-template-expressions": [
      2,
      {
        allowNumber: true,
        allowBoolean: false,
        allowNullable: false
      }
    ],
    "comma-dangle": [
      2,
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never"
      }
    ],
    "@typescript-eslint/space-before-function-paren": [
      2,
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always"
      }
    ],

    // WARNINGS -- TODO 1
    "sonarjs/cognitive-complexity": 0,
    "@typescript-eslint/require-await": 0,
    "sonarjs/no-duplicate-string": 0,
    "@typescript-eslint/no-non-null-assertion": 0,

    // TMP!.
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-floating-promises": [0, { ignoreVoid: true }],
    "no-void": [0, { allowAsStatement: true }],
    "import/first": 0,
    "@typescript-eslint/indent": 0
  }
};
