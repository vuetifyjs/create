export interface NuxtContext {
  cwd: string
  projectName: string
  projectRoot: string
  templateRoot: string
  templatePath: string
  nuxtPreset: 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
  useNuxtV4Compat: boolean
  useNuxtModule: boolean
  useNuxtSSR: boolean
  useNuxtSSRClientHints?: boolean
}

export type PackageJsonEntry = [name: string, value: string]

