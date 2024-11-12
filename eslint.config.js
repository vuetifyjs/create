// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import typescript from '@typescript-eslint/eslint-plugin';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import globals from 'globals';


export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...vueTsEslintConfig(),
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/template/**',
      '**/scripts/**',
      '**/vuetify-project/**',
    ],
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-type-checked'].rules,

      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline']
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
);
