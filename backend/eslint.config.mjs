import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nodePlugin from 'eslint-plugin-node';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig[]} */
const eslintConfig = [
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**, **.d.ts'],

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script', // CommonJS
        project: './tsconfig.json',
      },
    },

    plugins: {
      '@typescript-eslint': typescriptPlugin,
      node: nodePlugin,
      prettier: prettierPlugin,
    },

    rules: {
      // TypeScript Rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Node Rules
      'node/no-missing-import': 'off', // false positive with TS paths
      'node/no-unsupported-features/es-syntax': 'off',

      // Code Quality
      eqeqeq: 'error',
      'no-console': 'off',
      'max-len': ['warn', { code: 150 }],
      'prettier/prettier': 'error',
    },
  },
];

export default eslintConfig;
