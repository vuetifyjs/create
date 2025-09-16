// Node
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

// Types
import type { ContextState } from './utils/prompts'
import type { NuxtPresetName } from './utils/presets'

// Utils
import { initPrompts } from './utils/prompts'
import { red } from 'kolorist'
import { createBanner } from './utils/banner'
import minimist from 'minimist'
import { installDependencies, renderTemplate } from './utils'
import { renderNuxtTemplate } from './utils/nuxt/renderNuxtTemplate'

const validPresets = ['base', 'custom', 'default', 'essentials']

async function run () {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ['ts'],
    },
  })

  if (argv.preset && !validPresets.includes(argv.preset)) {
    throw new Error(`'${argv.preset}' is not a valid preset. Valid presets are: ${validPresets.join(', ')}.`)
  }

  const banner = createBanner()

  console.log(`\n${banner}\n`)

  const context: ContextState = {
    canOverwrite: false,
    cwd: process.cwd(),
    projectName: 'vuetify-project',
    useRouter: false,
    useTypeScript: argv.typescript,
    usePreset: argv.preset,
    useStore: undefined,
    usePackageManager: undefined,
  }

  const {
    canOverwrite,
    cwd,
    projectName,
    useTypeScript,
    usePackageManager,
    installDependencies: installDeps,
    usePreset,
    useNuxtModule,
    useNuxtSSR,
    useNuxtSSRClientHints,
  } = await initPrompts(context)

  const projectRoot = join(cwd, projectName)

  if (canOverwrite) {
    // Clean dir
    rmSync(projectRoot, { recursive: true })
  }

  const preset = context.usePreset ?? usePreset

  if (preset.startsWith('nuxt-')) {
    const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../template/typescript')
    const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), '../template/typescript/nuxt')
    // we are going to run Nuxi CLI that will handle the creation for us
    await renderNuxtTemplate({
      cwd,
      projectName,
      projectRoot,
      templateRoot,
      templatePath,
      nuxtPreset: preset as NuxtPresetName,
      useNuxtModule,
      useNuxtSSR,
      useNuxtSSRClientHints,
    })
  } else {
    // Create project directory
    mkdirSync(projectRoot)

    // Create base package.json
    writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify({ name: projectName }, null, 2))

    console.log('\n◌ Generating scaffold...')

    const jsOrTs = useTypeScript ? 'typescript' : 'javascript'
    const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), '../template', jsOrTs)

    renderTemplate(resolve(templatePath, 'default'), projectRoot)

    if (['base', 'essentials'].includes(usePreset)) {
      renderTemplate(resolve(templatePath, 'base'), projectRoot)
    }

    if (['essentials', 'recommended'].includes(usePreset)) {
      renderTemplate(resolve(templatePath, 'essentials'), projectRoot)
    }

    if (usePackageManager && installDeps) {
      console.log(`◌ Installing dependencies with ${usePackageManager}...\n`)
      await installDependencies(projectRoot, usePackageManager)
    }
  }

  console.log(`\n${projectName} has been generated at ${projectRoot}\n`)
}

run()
  .then(() => {
    console.log('Discord community: https://community.vuetifyjs.com')
    console.log('Github: https://github.com/vuetifyjs/vuetify')
    console.log('Support Vuetify: https://github.com/sponsors/johnleider')
    process.exit(0)
  })
  .catch(error => {
    console.error(`\n${red('✖')} ${error}\n`)
    process.exit(1)
  })
