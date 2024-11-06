// eslint.config.js
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
// import vuetify from 'eslint-config-vuetify';
import AutoImportJson from './.eslintrc-auto-import.json' assert { type: "json" };


// TODO: Need to update eslint-config-vuetify before adding

export default [
  eslint.configs.recommended,
   // ...vuetify,
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
