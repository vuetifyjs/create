import minimist from 'minimist'
import type { ContextState } from '../prompts'

export interface CliOptions {
  projectName?: string
  preset?: 'base' | 'default' | 'essentials' | 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
  typescript?: boolean
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'none'
  installDependencies?: boolean
  overwrite?: boolean
  nuxtModule?: boolean
  nuxtSSR?: boolean
  nuxtSSRClientHints?: boolean
  help?: boolean
  version?: boolean
}

const validPresets = ['base', 'default', 'essentials', 'nuxt-base', 'nuxt-default', 'nuxt-essentials'] as const
const validPackageManagers = ['npm', 'pnpm', 'yarn', 'bun', 'none'] as const

export function parseCliArgs (args: string[]): CliOptions {
  const argv = minimist(args, {
    alias: {
      typescript: ['ts'],
      preset: ['p'],
      packageManager: ['pm', 'package-manager'],
      installDependencies: ['install', 'i'],
      overwrite: ['force', 'f'],
      nuxtModule: ['nuxt-module'],
      nuxtSSR: ['nuxt-ssr', 'ssr'],
      nuxtSSRClientHints: ['nuxt-ssr-client-hints', 'client-hints'],
      help: ['h'],
      version: ['v'],
    },
    boolean: [
      'typescript',
      'installDependencies',
      'overwrite',
      'nuxtModule',
      'nuxtSSR',
      'nuxtSSRClientHints',
      'help',
      'version',
    ],
    string: [
      'preset',
      'packageManager',
    ],
  })

  if (argv.preset && !validPresets.includes(argv.preset)) {
    throw new Error(`'${argv.preset}' is not a valid preset. Valid presets are: ${validPresets.join(', ')}.`)
  }

  if (argv.packageManager && !validPackageManagers.includes(argv.packageManager)) {
    throw new Error(`'${argv.packageManager}' is not a valid package manager. Valid options are: ${validPackageManagers.join(', ')}.`)
  }

  const projectName = argv._[0] as string | undefined

  return {
    projectName,
    preset: argv.preset,
    typescript: argv.typescript,
    packageManager: argv.packageManager!,
    installDependencies: argv.installDependencies,
    overwrite: argv.overwrite,
    nuxtModule: argv.nuxtModule,
    nuxtSSR: argv.nuxtSSR,
    nuxtSSRClientHints: argv.nuxtSSRClientHints,
    help: argv.help,
    version: argv.version,
  }
}

export function cliOptionsToContext (cliOptions: CliOptions, cwd: string): Partial<ContextState> {
  return {
    cwd,
    projectName: cliOptions.projectName || 'vuetify-project',
    useTypeScript: cliOptions.typescript,
    usePreset: cliOptions.preset ?? 'default',
    usePackageManager: cliOptions.packageManager === 'none' ? undefined : cliOptions.packageManager,
    installDependencies: cliOptions.installDependencies,
    canOverwrite: cliOptions.overwrite ?? false,
    useNuxtModule: cliOptions.nuxtModule ?? true,
    useNuxtSSR: cliOptions.nuxtSSR ?? true,
    useNuxtSSRClientHints: cliOptions.nuxtSSRClientHints ?? (cliOptions.nuxtModule && cliOptions.nuxtSSR),
  }
}
