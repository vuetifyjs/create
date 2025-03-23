/**
 * ESLint configuration file.
 */
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vuetify from 'eslint-plugin-vuetify'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import globals from 'globals'

export default defineConfigWithVueTs(
  [
    js.configs['recommended'],
  ],
  vue.configs['flat/recommended'],
  vuetify.configs['flat/base'],
  vueTsConfigs.recommended,
  [
    {
      name: 'app/files-to-lint',
      files: ['**/*.{ts,mts,tsx,vue}'],
    },

    {
      name: 'app/files-to-ignore',
      ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },

    {
      rules: {
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
          },
        ],
        'vue/multi-word-component-names': 'off',
      },
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.browser
        }
      }
    }
  ])
