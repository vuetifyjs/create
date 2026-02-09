// Node
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs'

// Types
import type { ContextState } from './utils/prompts'
import type { NuxtPresetName } from './utils/presets'

// Utils
import { initPrompts } from './utils/prompts'
import { resolveNonInteractiveContext } from './utils/nonInteractivePrompts'
import { parseCliArgs, cliOptionsToContext, getHelpText, getVersionText } from './utils/cli'
import { red } from 'kolorist'
import { createBanner } from './utils/banner'
import { installDependencies, renderTemplate } from './utils'
import { renderNuxtTemplate } from './utils/nuxt/renderNuxtTemplate'
import { versionsV4 } from './utils/nuxt/versions'

async function run () {
  const args = process.argv.slice(2).slice()
  const banner = createBanner()

  if (args.length === 0) {
    console.log(`\n${banner}\n`)

    const initialContext: ContextState = {
      canOverwrite: false,
      cwd: process.cwd(),
      projectName: 'vuetify-project',
    }

    const finalContext = await initPrompts(initialContext)

    await createProject(finalContext)
    return
  }

  const cliOptions = parseCliArgs(args)

  if (cliOptions.help) {
    console.log(getHelpText())
    process.exit(0)
  }

  if (cliOptions.version) {
    console.log(getVersionText())
    process.exit(0)
  }

  console.log(`\n${banner}\n`)

  const cliContext = cliOptionsToContext(cliOptions, process.cwd())

  const initialContext: ContextState = {
    cwd: cliContext.cwd!,
    projectName: cliContext.projectName,
    canOverwrite: cliContext.canOverwrite,
    useTypeScript: cliContext.useTypeScript,
    usePreset: cliContext.usePreset,
    usePackageManager: cliContext.usePackageManager,
    installDependencies: cliContext.installDependencies,
    useNuxtModule: cliContext.useNuxtModule,
    useNuxtSSR: cliContext.useNuxtSSR,
    useNuxtSSRClientHints: cliContext.useNuxtSSRClientHints,
    vuetifyVersion: cliContext.vuetifyVersion,
  }

  const finalContext = resolveNonInteractiveContext(initialContext)

  await createProject(finalContext)
}

async function createProject (finalContext: any) {
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
  } = finalContext

  const projectRoot = join(cwd, projectName)

  if (canOverwrite && existsSync(projectRoot)) {
    rmSync(projectRoot, { recursive: true })
  }

  const preset = finalContext.usePreset ?? usePreset

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
      vuetifyVersion: finalContext.vuetifyVersion,
    })
  } else {
    // Create project directory
    mkdirSync(projectRoot)

    // Create base package.json
    writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify({ name: projectName }, null, 2))

    console.log('\n◌ Generating scaffold...')

    const jsOrTs = useTypeScript ? 'typescript' : 'javascript'
    const templatePath = resolve(dirname(fileURLToPath(import.meta.url)), '../template', jsOrTs)

    const replace = {
      '{{VUETIFY_VERSION}}': finalContext.vuetifyVersion === '4.x' ? '4 (Beta)' : '3',
    }

    renderTemplate(resolve(templatePath, 'default'), projectRoot, { replace })

    if (['base', 'essentials'].includes(usePreset)) {
      renderTemplate(resolve(templatePath, 'base'), projectRoot, { replace })
    }

    if (['essentials', 'recommended'].includes(usePreset)) {
      renderTemplate(resolve(templatePath, 'essentials'), projectRoot, { replace })
    }

    if (usePackageManager && installDeps) {
      console.log(`◌ Installing dependencies with ${usePackageManager}...\n`)
      await installDependencies(projectRoot, usePackageManager)
    }

    if (finalContext.vuetifyVersion === '4.x') {
      const packageJsonPath = resolve(projectRoot, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

      if (packageJson.dependencies?.vuetify) {
        packageJson.dependencies.vuetify = versionsV4.vuetify
      }

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
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
