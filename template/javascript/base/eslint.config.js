import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vuetify from 'eslint-plugin-vuetify'
import globals from 'globals'


export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...vuetify.configs['flat/base'],

  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  }
]
