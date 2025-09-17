export interface Preset {}

export type NuxtPresetName = 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
export type PresetName = 'base' | 'default' | 'essentials' | NuxtPresetName

const defaultContext: Preset = {}

const baseContext: Preset = {
  ...defaultContext,
}

const essentialsContext: Preset = {
  ...baseContext,
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
