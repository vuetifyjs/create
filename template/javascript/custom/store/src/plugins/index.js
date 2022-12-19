/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../store'

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(pinia)
}
