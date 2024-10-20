export default defineNuxtPlugin((nuxtApp) => {
  // check https://vuetify-nuxt-module.netlify.app/guide/nuxt-runtime-hooks.html
  nuxtApp.hook('vuetify:before-create', (options) => {
    if (import.meta.client) {
      console.log('vuetify:before-create', options)
    }
  })
})
