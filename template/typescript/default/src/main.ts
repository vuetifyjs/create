// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { loadFonts } from './plugins/webfontloader'
import vuetify from './plugins/vuetify'

createApp(App)
  .use(loadFonts)
  .use(vuetify)
  .mount('#app')
