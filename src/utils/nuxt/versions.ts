export const versions = {
  'vuetify': '^3.9.1',
  'typescript': '^5.8.3',
  'vue-tsc': '^3.2.0',
  'sass-embedded': '^1.89.2',
  '@vuetify/loader-shared': '^2.1.0',
  'vite-plugin-vuetify': '^2.1.1',
  'vuetify-nuxt-module': '^0.19.1',
  'upath': '^2.0.1',
  '@mdi/font': '^7.4.47',
  '@nuxt/fonts': '^0.11.4',
} as const

export const versionsV4 = {
  ...versions,
  vuetify: '^4.0.0-beta.1',
} as const
