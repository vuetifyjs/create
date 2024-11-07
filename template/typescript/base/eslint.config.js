// eslint.config.js
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import typescript from '@typescript-eslint/eslint-plugin';
import vueTsEslintConfig from '@vue/eslint-config-typescript';


export default tseslint.config(
  eslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...tseslint.configs.recommended,
  ...vueTsEslintConfig(),
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
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
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
