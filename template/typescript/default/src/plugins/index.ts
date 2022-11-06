/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

import type { App } from 'vue'
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  loadFonts()
  app.use(vuetify)
}
