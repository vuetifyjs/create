import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // WARNING: when switching ssr option in nuxt.config.ts file you need to manually change it here
    ssr: true,
    // your Vuetify options here
    theme: {
      defaultTheme: 'dark',
    },
  })

  nuxtApp.vueApp.use(vuetify);
})
