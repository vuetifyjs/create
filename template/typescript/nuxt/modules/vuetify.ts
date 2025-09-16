import { defineNuxtModule } from '@nuxt/kit'
import type { Options as ModuleOptions } from '@vuetify/loader-shared'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import path from 'upath'
import { isObject, resolveVuetifyBase } from '@vuetify/loader-shared'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

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
    const resolveCss = resolveCssFactory()

    nuxt.hook('vite:extendConfig', viteInlineConfig => {
      // add vuetify transformAssetUrls
      viteInlineConfig.vue ??= {}
      viteInlineConfig.vue.template ??= {}
      viteInlineConfig.vue.template.transformAssetUrls = transformAssetUrls

      viteInlineConfig.plugins = viteInlineConfig.plugins ?? []
      viteInlineConfig.plugins.push(vuetify({
        autoImport: options.autoImport,
        styles: true,
      }), {
        name: 'vuetify:nuxt:styles',
        enforce: 'pre',
        async configResolved (config) {
          if (isObject(options.styles)) {
            sassVariables = true
            configFile = path.isAbsolute(options.styles.configFile) ? path.resolve(options.styles.configFile) : path.resolve(path.join(config.root || process.cwd(), options.styles.configFile))
            configFile = pathToFileURL(configFile).href
          } else {
            isNone = options.styles === 'none'
          }
        },
        async resolveId (source, importer, { custom, ssr }) {
          if (source.startsWith(PREFIX) || source.startsWith(SSR_PREFIX)) {
            if (/\.s[ca]ss$/.test(source)) {
              return source
            }

            const idx = source.indexOf('?')
            return idx === -1 ? source : source.slice(0, idx)
          }
          if (
            source === 'vuetify/styles' || (
              importer
              && source.endsWith('.css')
              && isSubdir(vuetifyBase, path.isAbsolute(source) ? source : importer)
            )
          ) {
            if (options.styles === 'sass') {
              return this.resolve(await resolveCss(source), importer, { skipSelf: true, custom })
            }

            const resolution = await this.resolve(source, importer, { skipSelf: true, custom })

            if (!resolution) {
              return undefined
            }

            const target = await resolveCss(resolution.id)
            if (isNone) {
              noneFiles.add(target)
              return target
            }

            return `${ssr ? SSR_PREFIX : PREFIX}${path.relative(vuetifyBase, target)}`
          }

          return undefined
        },
        load (id) {
          if (sassVariables) {
            const target = id.startsWith(PREFIX)
              ? path.resolve(vuetifyBase, id.slice(PREFIX.length))
              : (id.startsWith(SSR_PREFIX)
                  ? path.resolve(vuetifyBase, id.slice(SSR_PREFIX.length))
                  : undefined)

            if (target) {
              const suffix = /\.scss/.test(target) ? ';\n' : '\n'
              return {
                code: `@use "${configFile}"${suffix}@use "${pathToFileURL(target).href}"${suffix}`,
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

function resolveCssFactory () {
  const mappings = new Map<string, string>()
  return async (source: string) => {
    let mapping = mappings.get(source)
    if (!mapping) {
      try {
        mapping = source.replace(/\.css$/, '.sass')
        await fsp.access(mapping, fs.constants.R_OK)
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
          throw error
        }
        mapping = source.replace(/\.css$/, '.scss')
      }
      mappings.set(source, mapping)
    }
    return mapping
  }
}

function isSubdir (root: string, test: string) {
  const relative = path.relative(root, test)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export { type Options as ModuleOptions } from '@vuetify/loader-shared'
