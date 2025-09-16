// Node
import { join, resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'

// Types
import type { Options as PromptOptions } from 'prompts'

// Utils
import { presets } from './presets'
import { red } from 'kolorist'
import prompts from 'prompts'
import { packageManager as defaultPackageManager } from './installDependencies'
import validate from 'validate-npm-package-name'

type ContextState = {
  cwd: string
  projectName?: string
  canOverwrite?: boolean
  useTypeScript?: boolean
  usePackageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun'
  installDependencies?: boolean
  usePreset?: 'base' | 'default' | 'essentials' | 'nuxt-base' | 'nuxt-default' | 'nuxt-essentials'
  useEslint?: boolean
  useRouter?: boolean
  useStore?: boolean
  useNuxtV4Compat?: boolean
  useNuxtModule?: boolean
  useNuxtSSR?: boolean
  useNuxtSSRClientHints?: boolean
}

const promptOptions: PromptOptions = {
  onCancel: () => {
    throw new Error(red('✖') + ' Operation cancelled')
  },
}

type DefinedContextState = { [P in keyof ContextState]-?: ContextState[P] }

async function initPrompts (context: ContextState) {
  type Answers = prompts.Answers<
    'projectName' | 'canOverwrite' | 'usePreset' | 'useTypeScript' | 'usePackageManager' | 'installDependencies' | 'useNuxtV4Compat' | 'useNuxtModule' | 'useNuxtSSR' | 'useNuxtSSRClientHints'
  >

  if (context.usePreset) {
    context = {
      ...context,
      ...presets[context.usePreset],
    }
  }

  const answers: Answers = await prompts([
    {
      name: 'projectName',
      type: 'text',
      message: 'Project name:',
      initial: 'vuetify-project',
      format: (v: string) => v.trim(),
      validate: (v: string) => {
        const { errors, warnings, validForNewPackages: isValid } = validate(String(v).trim())

        const error = isValid ? null : (errors ? errors[0] : warnings![0])

        if (!isValid) {
          return `Package ${error}`
        }
        return true
      },
    },
    {
      name: 'canOverwrite',
      active: 'Yes',
      inactive: 'No',
      initial: false,
      type: (_: any, { projectName }) => {
        const projectPath = join(context.cwd, projectName)

        return (
          !existsSync(projectPath)
          || readdirSync(projectPath).length === 0
        )
          ? null
          : 'toggle'
      },
      onState (a) {
        if (!a.value) {
          console.error('\n\n', red('✖') + ' Target directory exists and is not empty.')
          process.exit(1)
        }
      },
      message: (prev: string) => `The project path: ${resolve(context.cwd, prev)} already exists, would you like to overwrite this directory?`,
    },
    {
      name: 'usePreset',
      type: context.usePreset ? null : 'select',
      message: 'Which preset would you like to install?',
      initial: 1,
      choices: [
        { title: 'Barebones (Only Vue & Vuetify)', value: 'default' },
        { title: 'Default (Adds routing, ESLint & SASS variables)', value: 'base' },
        { title: 'Recommended (Everything from Default. Adds auto importing, layouts & pinia)', value: 'essentials' },
        { title: 'Nuxt Barebones (Only Vuetify)', value: 'nuxt-default' },
        { title: 'Nuxt Default (Adds Nuxt ESLint & SASS variables)', value: 'nuxt-base' },
        { title: 'Nuxt Recommended (Everything from Default. Enables auto importing & layouts)', value: 'nuxt-essentials' },
      ],
    },
    {
      name: 'useTypeScript',
      type: usePreset => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') || context.useTypeScript ? null : 'toggle'
      },
      message: 'Use TypeScript?',
      active: 'Yes',
      inactive: 'No',
      initial: false,
    },
    {
      name: 'usePackageManager',
      type: (_, { usePreset }) => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') ? null : 'select'
      },
      message: 'Would you like to install dependencies with yarn, npm, pnpm, or bun?',
      initial: defaultPackageManager === 'bun' ? 3 : 0,
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
        { title: 'none', value: null },
      ],
    },
    {
      name: 'installDependencies',
      type: (_, { usePreset }) => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') || context.installDependencies ? null : 'toggle'
      },
      message: 'Install Dependencies?',
      active: 'Yes',
      inactive: 'No',
      initial: 'Yes',
    },
    {
      name: 'useNuxtV4Compat',
      type: (_, { usePreset }) => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') ? 'toggle' : null
      },
      message: 'Use Nuxt v4 compatibility?',
      active: 'Yes',
      inactive: 'No',
      initial: 'Yes',
    },
    {
      name: 'useNuxtModule',
      type: (_, { usePreset }) => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') ? 'toggle' : null
      },
      message: 'Use vuetify-nuxt-module?',
      active: 'Yes',
      inactive: 'No',
      initial: 'Yes',
    },
    {
      name: 'useNuxtSSR',
      type: (_, { usePreset }) => {
        const p = context.usePreset ?? usePreset
        return p.startsWith('nuxt-') ? 'toggle' : null
      },
      message: 'Enable Nuxt SSR?',
      active: 'Yes',
      inactive: 'No',
      initial: 'Yes',
    },
    {
      name: 'useNuxtSSRClientHints',
      type: (useNuxtSSR, { usePreset, useNuxtModule }) => {
        const p = context.usePreset ?? usePreset
        if (!p.startsWith('nuxt-')) {
          return null
        }
        return useNuxtModule && useNuxtSSR ? 'toggle' : null
      },
      message: 'Enable Nuxt SSR Http Client Hints?',
      active: 'Yes',
      inactive: 'No',
      initial: 'Yes',
    },
  ], promptOptions)

  return {
    ...context,
    ...answers,
  } as DefinedContextState
}

export { initPrompts }
export type { ContextState }
