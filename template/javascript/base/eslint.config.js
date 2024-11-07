/**
 * eslint.config.js
 *
 * https://eslint.org/, https://eslint.vuejs.org/user-guide/
 */
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import { includeIgnoreFile } from '@eslint/compat';
import { fileURLToPath, URL } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default [
  eslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  includeIgnoreFile(gitignorePath),
	{
		// your overrides
	},
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
    ],
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
    plugins: {
      pluginVue,
      import: importPlugin,
    },
    rules: {
      ...eslint.configs.recommended.rules,

      'vue/multi-word-component-names': 0,
    }
  },
];
