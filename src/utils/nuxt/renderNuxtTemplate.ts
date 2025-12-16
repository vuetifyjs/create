// Node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

// Types
import type { NuxtContext, PackageJsonEntry } from './types'

// Utils
import { addPackageObject, detectPkgInfo, editFile, getPaths, runCommand } from './utils'
import { versions } from './versions'
import { detect } from 'package-manager-detector'
import { generateCode, parseModule } from 'magicast'
import { addNuxtModule, getDefaultExportOptions } from 'magicast/helpers'

export async function renderNuxtTemplate (ctx: NuxtContext) {
  const {
    cwd,
    projectName,
    projectRoot,
    nuxtPreset,
  } = ctx

  const pkgInfo = detectPkgInfo()
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.')

  const customCommand = `npm exec nuxi init ${projectName}`

  const fullCustomCommand = customCommand
    // Only Yarn 1.x doesn't support `@version` in the `create` command
    .replace('@latest', () => (isYarn1 ? '' : '@latest'))
    .replace(/^npm exec/, () => {
      // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
      if (pkgManager === 'pnpm') {
        return 'pnpm dlx'
      }

      if (pkgManager === 'yarn' && !isYarn1) {
        return 'yarn dlx'
      }

      if (pkgManager === 'bun') {
        return 'bun x'
      }

      // Use `npm exec` in all other cases,
      // including Yarn 1.x and other custom npm clients.
      return 'npm exec'
    })

  const [command, ...args] = fullCustomCommand.split(' ')

  const nuxiCli = spawnSync(command, args, {
    cwd,
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: true,
  })

  if (nuxiCli.error) {
    throw nuxiCli.error
  }

  // configure package.json
  configurePackageJson(ctx)

  const pmDetection = await detect({ cwd: projectRoot })

  // install dependencies
  runCommand(pmDetection, 'install', [], projectRoot)

  // copy/replace resources
  prepareProject(ctx)

  // install nuxt eslint: https://eslint.nuxt.com/packages/module#quick-setup
  if (nuxtPreset !== 'nuxt-default') {
    // we need eslint before executing the prepare command:
    // once prepare command run, the eslint.config.mjs file will be created
    runCommand(pmDetection, 'execute', ['nuxi', 'module', 'add', 'eslint'], projectRoot)
  }
}

function configurePackageJson ({
  projectName,
  projectRoot,
  useNuxtModule,
  nuxtPreset,
}: NuxtContext) {
  const packageJson = path.join(projectRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  pkg.name = projectName

  // prepare scripts
  const scripts: PackageJsonEntry[] = [
    ['prepare', 'nuxt prepare'],
    ['typecheck', 'nuxt typecheck'],
  ]
  if (nuxtPreset !== 'nuxt-default') {
    scripts.push(['lint', 'eslint .'], ['lint:fix', 'eslint . --fix'])
  }

  // prepare dependencies
  const dependencies: PackageJsonEntry[] = [
    ['vuetify', versions.vuetify],
  ]
  if (dependencies.length > 0) {
    addPackageObject('dependencies', dependencies, pkg)
  }

  // prepare devDependencies
  const devDependencies: PackageJsonEntry[] = [
    ['@mdi/font', versions['@mdi/font']],
    ['@nuxt/fonts', versions['@nuxt/fonts']],
    ['sass-embedded', versions['sass-embedded']],
    ['typescript', versions.typescript],
    ['vue-tsc', versions['vue-tsc']],
  ]
  if (useNuxtModule) {
    devDependencies.push(['vuetify-nuxt-module', versions['vuetify-nuxt-module']])
  } else {
    devDependencies.push(['upath', versions['upath']], ['@vuetify/loader-shared', versions['@vuetify/loader-shared']], ['vite-plugin-vuetify', versions['vite-plugin-vuetify']])
  }
  if (devDependencies.length > 0) {
    addPackageObject('devDependencies', devDependencies, pkg)
  }

  // add scripts
  addPackageObject('scripts', scripts, pkg, false)

  // save package.json
  fs.writeFileSync(packageJson, JSON.stringify(pkg, null, 2), 'utf8')
}

function configureVuetify (ctx: NuxtContext, nuxtConfig: ReturnType<typeof parseModule>) {
  const config = getDefaultExportOptions(nuxtConfig)
  config.ssr = ctx.useNuxtSSR
  config.features = {
    inlineStyles: !ctx.useNuxtModule,
    devLogs: !ctx.useNuxtModule,
  }
  config.build = { transpile: ['vuetify'] }
  config.vite = {
    ssr: {
      noExternal: ['vuetify'],
    },
  }
  config.css = []
  // vuetify-nuxt-module:
  // - will detect @mdi/font adding to the css array
  // - will add vuetify/styles to the css array if not disabled
  if (!ctx.useNuxtModule) {
    config.css.push('@mdi/font/css/materialdesignicons.css')
    // eslint-disable-next-line unicorn/prefer-single-call
    config.css.push('vuetify/styles')
  }
  // todo: add only required fonts
  addNuxtModule(nuxtConfig, '@nuxt/fonts')
  return config
}

function copyResources (
  ctx: NuxtContext,
  rootPath: string,
  templateDir: string,
) {
  const {
    useNuxtSSR,
    nuxtPreset,
    useNuxtModule,
    templateRoot,
  } = ctx

  // assets folder
  const assetsDir = path.join(rootPath, 'assets')
  let templateAssetsDir = path.join(templateRoot, 'default/src/assets')
  fs.mkdirSync(assetsDir)
  fs.copyFileSync(
    path.join(templateAssetsDir, 'logo.png'),
    path.join(assetsDir, 'logo.png'),
  )
  fs.copyFileSync(
    path.join(templateAssetsDir, 'logo.svg'),
    path.join(assetsDir, 'logo.svg'),
  )
  if (nuxtPreset !== 'nuxt-default') {
    templateAssetsDir = path.join(templateRoot, 'base/src/styles')

    fs.copyFileSync(
      path.join(templateAssetsDir, 'settings.scss'),
      path.join(assetsDir, 'settings.scss'),
    )
  }

  // plugins folder
  const pluginsDir = path.join(rootPath, 'plugins')
  const templatePluginsDir = path.join(templateDir, 'plugins')
  fs.mkdirSync(pluginsDir)
  if (useNuxtModule) {
    // vuetify configuration file
    // v4: modules at root => rootPath is `${rootPath}/app`
    // https://nuxt.com/docs/getting-started/upgrade#migrating-to-nuxt-4
    fs.copyFileSync(
      path.join(templateDir, 'vuetify.config.ts'),
      path.join(rootPath, '../vuetify.config.ts'),
    )
    // vuetify plugin
    fs.copyFileSync(
      path.join(templatePluginsDir, 'vuetify-nuxt.ts'),
      path.join(pluginsDir, 'vuetify.ts'),
    )
  } else {
    // custom vuetify nuxt module
    // v4: modules at root => rootPath is `${rootPath}/app`
    const modulesDir = path.join(rootPath, '../modules')
    const templateModulesDir = path.join(templateDir, 'modules')
    fs.mkdirSync(modulesDir)
    fs.copyFileSync(
      path.resolve(templateModulesDir, 'vuetify.ts'),
      path.resolve(modulesDir, 'vuetify.ts'),
    )
    // vuetify plugin
    editFile(
      path.join(templatePluginsDir, 'vuetify.ts'),
      content => {
        return useNuxtSSR ? content : content.replace('ssr: true,', 'ssr: false,')
      },
      path.resolve(pluginsDir, 'vuetify.ts'),
    )
  }
  // components
  fs.copyFileSync(
    path.resolve(templateDir, nuxtPreset === 'nuxt-essentials' ? 'app-layout.vue' : 'app.vue'),
    path.resolve(rootPath, 'app.vue'),
  )

  // layouts
  if (nuxtPreset === 'nuxt-essentials') {
    const layoutsDir = path.join(rootPath, 'layouts')
    const templateLayoutsDir = path.join(templateDir, 'layouts')
    fs.mkdirSync(layoutsDir)
    fs.copyFileSync(
      path.resolve(templateLayoutsDir, 'default.vue'),
      path.resolve(layoutsDir, 'default.vue'),
    )
  }
  const componentsDir = path.join(rootPath, 'components')
  const templateComponentsDir = path.join(templateDir, 'components')
  fs.mkdirSync(componentsDir)
  fs.copyFileSync(
    path.resolve(templateComponentsDir, 'AppFooter.vue'),
    path.resolve(componentsDir, 'AppFooter.vue'),
  )
  fs.copyFileSync(
    path.resolve(templateComponentsDir, 'HelloWorld.vue'),
    path.resolve(componentsDir, 'HelloWorld.vue'),
  )
  // pages
  const pagesDir = path.join(rootPath, 'pages')
  const templatePagesDir = path.join(templateDir, 'pages')
  fs.mkdirSync(pagesDir)
  fs.copyFileSync(
    path.resolve(templatePagesDir, 'index.vue'),
    path.resolve(pagesDir, 'index.vue'),
  )
}

function prepareNuxtModule (
  ctx: NuxtContext,
  nuxtConfig: ReturnType<typeof parseModule>,
) {
  // prepare nuxt config
  const moduleOptions = {
    ssrClientHints: {
      reloadOnFirstRequest: false,
      viewportSize: ctx.useNuxtSSR && ctx.useNuxtSSRClientHints,
      prefersColorScheme: false,
      prefersColorSchemeOptions: {
        useBrowserThemeOnly: false,
      },
    },
    styles: ctx.nuxtPreset === 'nuxt-default'
      ? true
      : {
          configFile: 'assets/settings.scss',
        },
  }
  configureVuetify(ctx, nuxtConfig)
  addNuxtModule(
    nuxtConfig,
    'vuetify-nuxt-module',
    'vuetify',
    { moduleOptions },
  )
}

function prepareVuetifyModule (
  ctx: NuxtContext,
  nuxtConfig: ReturnType<typeof parseModule>,
) {
  // prepare nuxt config
  const config = configureVuetify(ctx, nuxtConfig)

  // enable auto import and include styles
  const styles = ctx.nuxtPreset === 'nuxt-essentials'
    ? {
        configFile: 'assets/settings.scss',
      }
    : true
  config.vuetify = { autoImport: true, styles }
}

function prepareProject (ctx: NuxtContext) {
  const {
    projectRoot,
    templatePath,
    useNuxtModule,
  } = ctx
  const [rootPath, templateDir] = getPaths(projectRoot, templatePath)

  // load nuxt config file
  // v4 compat: rootPath is `${rootPath}/app`
  // https://nuxt.com/docs/getting-started/upgrade#migrating-to-nuxt-4
  const nuxtConfigFile = path.join(rootPath, '../nuxt.config.ts')
  const nuxtConfig = parseModule(fs.readFileSync(nuxtConfigFile, 'utf8'))

  // prepare nuxt config
  if (useNuxtModule) {
    prepareNuxtModule(ctx, nuxtConfig)
  } else {
    prepareVuetifyModule(ctx, nuxtConfig)
  }

  // prepare nuxt config
  let code = generateCode(nuxtConfig, {
    trailingComma: true,
    quote: 'single',
    arrayBracketSpacing: false,
    objectCurlySpacing: true,
    lineTerminator: '\n',
    format: {
      trailingComma: true,
      quote: 'single',
      arrayBracketSpacing: false,
      objectCurlySpacing: true,
      useSemi: false,
    },
  }).code

  // add some hints to the nuxt config
  // https://github.com/Pinegrow/pg-nuxt-vuetify-tailwindcss/blob/00fac86769bc43e034b90dacfd03becc92b93b53/nuxt.config.ts#L100-L104
  if (useNuxtModule) {
    code = code.replace('ssrClientHints:', `// check https://nuxt.vuetifyjs.com/guide/server-side-rendering.html
      ssrClientHints:`)
    code = code.replace('styles:', `// /* If customizing sass global variables ($utilities, $reset, $color-pack, $body-font-family, etc) */
      // disableVuetifyStyles: true,
      styles:`)
  } else {
    code = code.replace('ssr:', `// when enabling/disabling ssr option, remember to update ssr option in plugins/vuetify.ts
  ssr:`)
  }
  code = code.replace('features:', `// when enabling ssr option you need to disable inlineStyles and maybe devLogs
  features:`)

  // save nuxt config file
  fs.writeFileSync(
    nuxtConfigFile,
    code,
    'utf8',
  )

  // prepare resources
  copyResources(ctx, rootPath, templateDir)
}
