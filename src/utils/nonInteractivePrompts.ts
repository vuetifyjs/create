import { join, resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'

import type { ContextState } from './prompts'

import { presets } from './presets'
import { red } from 'kolorist'
import { packageManager as defaultPackageManager } from './installDependencies'

type DefinedContextState = { [P in keyof ContextState]-?: ContextState[P] }

export function resolveNonInteractiveContext (context: ContextState): DefinedContextState {
  if (context.usePreset) {
    context = {
      ...context,
      ...presets[context.usePreset],
    }
  }

  const projectName = context.projectName || 'vuetify-project'

  const projectPath = join(context.cwd, projectName)
  const directoryExists = existsSync(projectPath)
  const directoryNotEmpty = directoryExists && readdirSync(projectPath).length > 0

  if (directoryNotEmpty && !context.canOverwrite) {
    console.error('\n\n', red('✖') + ` Target directory ${resolve(context.cwd, projectName)} exists and is not empty.`)
    console.error('Use --force or --overwrite flag to overwrite the directory.')
    process.exit(1)
  }

  let useTypeScript = context.useTypeScript
  if (useTypeScript === undefined) {
    const preset = context.usePreset
    useTypeScript = preset ? preset.startsWith('nuxt-') : false
  }

  let usePackageManager = context.usePackageManager
  if (usePackageManager === undefined) {
    const preset = context.usePreset
    if (!preset || !preset.startsWith('nuxt-')) {
      usePackageManager = defaultPackageManager as 'npm' | 'pnpm' | 'yarn' | 'bun'
    }
  }

  let installDependencies = context.installDependencies
  if (installDependencies === undefined) {
    const preset = context.usePreset
    installDependencies = preset ? !preset.startsWith('nuxt-') : true
  }

  const usePreset = context.usePreset || 'default'

  const useNuxtModule = context.useNuxtModule
  const useNuxtSSR = context.useNuxtSSR
  const useNuxtSSRClientHints = context.useNuxtSSRClientHints
  const vuetifyVersion = context.vuetifyVersion

  return {
    cwd: context.cwd,
    projectName,
    canOverwrite: context.canOverwrite || false,
    useTypeScript: useTypeScript || false,
    usePackageManager: usePackageManager || 'npm',
    installDependencies: installDependencies || false,
    usePreset,
    useNuxtModule: useNuxtModule || false,
    useNuxtSSR: useNuxtSSR || false,
    useNuxtSSRClientHints: useNuxtSSRClientHints || false,
    vuetifyVersion: vuetifyVersion || '3.x',
  }
}
