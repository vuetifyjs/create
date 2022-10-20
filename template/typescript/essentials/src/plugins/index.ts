/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import { loadFonts } from './webfontloader'

export function registerPlugins (app) {
  loadFonts()
}
