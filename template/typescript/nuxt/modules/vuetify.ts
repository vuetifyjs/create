import { defineNuxtModule } from '@nuxt/kit'
import type { Options as ModuleOptions } from '@vuetify/loader-shared'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import path from 'upath'
import { isObject, resolveVuetifyBase } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'

export type { ModuleOptions }

// WARNING: Remove the file from modules directory if you install vuetify-nuxt-module
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vuetify-module',
    configKey: 'vuetify',
  },
  defaults: () => ({ styles: true }),
  setup (options, nuxt) {
    let configFile: string | undefined
    const vuetifyBase = resolveVuetifyBase()
    const noneFiles = new Set<string>()
    let isNone = false
    let sassVariables = false
    const PREFIX = 'vuetify-styles/'
    const SSR_PREFIX = `/@${PREFIX}`

    nuxt.hook('vite:extendConfig', viteInlineConfig => {
      // add vuetify transformAssetUrls
      viteInlineConfig.vue ??= {}
      viteInlineConfig.vue.template ??= {}
      viteInlineConfig.vue.template.transformAssetUrls = transformAssetUrls

      viteInlineConfig.plugins = viteInlineConfig.plugins ?? []
      viteInlineConfig.plugins.push(vuetify({
        autoImport: options.autoImport,
        styles: true,
      }))

      viteInlineConfig.css ??= {}
      viteInlineConfig.css.preprocessorOptions ??= {}
      viteInlineConfig.css.preprocessorOptions.sass ??= {}
      viteInlineConfig.css.preprocessorOptions.sass.api = 'modern-compiler'

      viteInlineConfig.plugins.push({
        name: 'vuetify:nuxt:styles',
        enforce: 'pre',
        async configResolved (config) {
          if (isObject(options.styles)) {
            sassVariables = true
            if (path.isAbsolute(options.styles.configFile)) {
              configFile = path.resolve(options.styles.configFile)
            } else {
              configFile = path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
            }
            configFile = pathToFileURL(configFile).href
          }
          else {
            isNone = options.styles === 'none'
          }
        },
        async resolveId (source, importer, { custom, ssr }) {
          if (source.startsWith(PREFIX) || source.startsWith(SSR_PREFIX)) {
            if (source.endsWith('.sass')) {
              return source
            }

            const idx = source.indexOf('?')
            return idx > -1 ? source.slice(0, idx) : source
          }
          if (
            source === 'vuetify/styles' || (
              importer &&
              source.endsWith('.css') &&
              isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
            )
          ) {
            if (options.styles === 'sass') {
              const target = source.replace(/\.css$/, '.sass')
              return this.resolve(target, importer, { skipSelf: true, custom })
            }

            const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

            if (!resolution)
              return undefined

            const target = resolution.id.replace(/\.css$/, '.sass')
            if (isNone) {
              noneFiles.add(target)
              return target
            }

            return `${ssr ? SSR_PREFIX: PREFIX}${path.relative(vuetifyBase, target)}`
          }

          return undefined
        },
        load (id){
          if (sassVariables) {
            const target = id.startsWith(PREFIX)
              ? path.resolve(vuetifyBase, id.slice(PREFIX.length))
              : id.startsWith(SSR_PREFIX)
                ? path.resolve(vuetifyBase, id.slice(SSR_PREFIX.length))
                : undefined

            if (target) {
              return {
                code: `@use "${configFile}"\n@use "${pathToFileURL(target).href}"`,
                map: {
                  mappings: '',
                },
              }
            }
          }

          return isNone && noneFiles.has(id) ? '' : undefined
        },
      })
    })
  },
})

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}
