export interface Preset {
  useEslint: boolean
  useRouter: boolean
  useStore: boolean
}

export type NuxtPresetName = 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
export type PresetName = 'base' | 'default' | 'essentials' | NuxtPresetName

const defaultContext: Preset = {
  useEslint: false,
  useRouter: false,
  useStore: false,
}

const baseContext: Preset = {
  ...defaultContext,
  useEslint: true,
  useRouter: true,
}

const essentialsContext: Preset = {
  ...baseContext,
  useStore: true,
}

const presets: Record<PresetName, Preset> = {
  'base': baseContext,
  'default': defaultContext,
  'essentials': essentialsContext,
  'nuxt-base': baseContext,
  'nuxt-default': defaultContext,
  'nuxt-essentials': essentialsContext,
}

export { presets }
