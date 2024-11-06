// eslint.config.js
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';


export default [
  eslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],

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
