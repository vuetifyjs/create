export interface NuxtContext {
  cwd: string
  projectName: string
  projectRoot: string
  templateRoot: string
  templatePath: string
  nuxtPreset: 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
  useNuxtModule: boolean
  useNuxtSSR: boolean
  useNuxtSSRClientHints?: boolean
  vuetifyVersion?: '3.x' | '4.x'
}

export type PackageJsonEntry = [name: string, value: string]
