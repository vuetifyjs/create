/**
 * eslint.config.js
 *
 * https://eslint.org/, https://eslint.vuejs.org/user-guide/
 */
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import typescript from '@typescript-eslint/eslint-plugin'
import vuetify from 'eslint-config-vuetify'
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

const AutoImportJson = JSON.parse(fs.readFileSync(new URL('./.eslintrc-auto-import.json', import.meta.url), 'utf-8'))
const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default tseslint.config(
  ...vuetify,
  ...tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath),
	{
		// your overrides
	},
  {
    name: 'app/files-to-ignore',
    ignores: [
      'vite.config.*',
      '**/*.d.ts',
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
    ],
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      ...AutoImportJson,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.json', './tsconfig.node.json'],
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    plugins: {
      pluginVue,
      import: importPlugin,
      'typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-type-checked'].rules,

      '@typescript-eslint/no-floating-promises': 0,
      'vue/multi-word-component-names': 0,
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
