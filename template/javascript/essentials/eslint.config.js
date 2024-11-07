/**
 * eslint.config.js
 *
 * https://eslint.org/, https://eslint.vuejs.org/user-guide/
 */
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import pluginVue from 'eslint-plugin-vue'
import vuetify from 'eslint-config-vuetify'
import fs from 'node:fs'

const AutoImportJson = JSON.parse(fs.readFileSync(new URL('./.eslintrc-auto-import.json', import.meta.url), 'utf-8'))

export default [
   ...vuetify,

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
    languageOptions: {
      ...AutoImportJson,
    },
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
