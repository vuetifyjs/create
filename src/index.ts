#!/usr/bin/env node

// Node
import { resolve, join } from 'path'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs'

// Types
import type { Answers } from 'prompts'

// Utils
import { red } from 'kolorist'
import minimist from 'minimist'
import prompts from 'prompts'
import validate from 'validate-npm-package-name'
import { installDependencies, renderTemplate } from './utils'

const validPresets = ['base', 'default', 'essentials']

type PromptQuestions = 'projectName' | 'canOverwrite' | 'useTypeScript' | 'usePackageManager' | 'usePreset'

async function run () {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
  })

  if (argv.preset && !validPresets.includes(argv.preset)) {
    throw new Error(`'${argv.preset}' is not a valid preset. Valid presets are: 'default', 'base', 'essentials'.`)
  }

  const banner = '[38;2;22;151;246mV[39m[38;2;22;147;242mu[39m[38;2;22;144;238me[39m[38;2;22;140;234mt[39m[38;2;23;136;229mi[39m[38;2;23;133;225mf[39m[38;2;23;129;221my[39m[38;2;23;125;217m.[39m[38;2;23;121;213mj[39m[38;2;23;118;209ms[39m [38;2;24;114;204m-[39m [38;2;24;110;200mM[39m[38;2;24;107;196ma[39m[38;2;24;103;192mt[39m[38;2;32;110;197me[39m[38;2;39;118;202mr[39m[38;2;47;125;207mi[39m[38;2;54;132;211ma[39m[38;2;62;140;216ml[39m [38;2;70;147;221mC[39m[38;2;77;154;226mo[39m[38;2;85;161;231mm[39m[38;2;93;169;236mp[39m[38;2;100;176;240mo[39m[38;2;108;183;245mn[39m[38;2;115;191;250me[39m[38;2;123;198;255mn[39m[38;2;126;199;255mt[39m [38;2;129;201;255mF[39m[38;2;133;202;255mr[39m[38;2;136;204;255ma[39m[38;2;139;205;255mm[39m[38;2;142;207;255me[39m[38;2;145;208;255mw[39m[38;2;149;210;255mo[39m[38;2;152;211;255mr[39m[38;2;155;212;255mk[39m [38;2;158;214;255mf[39m[38;2;161;215;255mo[39m[38;2;164;217;255mr[39m [38;2;168;218;255mV[39m[38;2;171;220;255mu[39m[38;2;174;221;255me[39m'

  console.log(`\n${banner}\n`)

  let context: Answers<PromptQuestions> = {
    projectName: undefined,
    canOverwrite: undefined,
    useTypeScript: argv.typescript,
    usePackageManager: undefined,
    usePreset: argv.preset,
  }

  try {
    context = await prompts<PromptQuestions>([
        {
          name: 'projectName',
          type: 'text',
          message: 'Project name:',
          initial: 'vuetify-project',
          validate: v => {
            const { errors } = validate(String(v).trim())

            return !(errors && errors.length) || `Package ${errors[0]}`
          },
        },
        {
          name: 'canOverwrite',
          active: 'Yes',
          inactive: 'No',
          initial: false,
          type: (_, { projectName }) => {
            const projectPath = join(cwd, projectName)

            return (
              !existsSync(projectPath) ||
              readdirSync(projectPath).length === 0
            ) ? null : 'toggle'
          },
          message: prev => `The project path: ${resolve(cwd, prev)} already exists, would you like to overwrite this directory?`,
        },
        {
          name: 'useTypeScript',
          type: context.useTypeScript ? null : 'toggle',
          message: 'Use TypeScript?',
          active: 'Yes',
          inactive: 'No',
          initial: false,
        },
        {
          name: 'usePackageManager',
          type: 'select',
          message: 'Would you like to install dependencies with yarn, npm, or pnpm?',
          initial: 0,
          choices: [
            { title: 'yarn', value: 'yarn' },
            { title: 'npm', value: 'npm' },
            { title: 'pnpm', value: 'pnpm' },
            { title: 'none', value: null },
          ],
        },
        {
          name: 'usePreset',
          type: context.usePreset ? null : 'select',
          message: 'Which bundle would you like to install?',
          initial: 1,
          choices: [
            { title: 'Default (Vuetify)', value: 'default' },
            { title: 'Base (Vuetify, VueRouter)', value: 'base' },
            { title: 'Essentials (Vuetify, VueRouter, Pinia)', value: 'essentials' },
          ],
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      },
    )
  } catch (err) {
    throw err
  }

  const {
    canOverwrite,
    projectName,
    useTypeScript,
    usePackageManager,
    usePreset,
  } = context

  const projectRoot = join(cwd, projectName)

  if (canOverwrite) {
    // Clean dir
    rmSync(projectRoot, { recursive: true })
  }

  mkdirSync(projectRoot)

  const rootPkg = { name: projectName }

  writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify(rootPkg, null, 2))

  const rootTemplatePath = resolve(__dirname, '../template')
  const jsOrTs = useTypeScript || argv.typescript ? 'typescript' : 'javascript'
  const preset = argv.preset || usePreset

  console.log('\n◌ Generating scaffold...')
  renderTemplate(resolve(rootTemplatePath, jsOrTs, preset), projectRoot)

  if (usePackageManager) {      
    console.log(`◌ Installing dependencies with ${usePackageManager}...\n`)
    installDependencies(projectRoot, usePackageManager)
  }

  console.log(`\n${projectName} has been generated at ${projectRoot}\n`)
}

run()
  .then(() => {
    console.log('Discord community: https://community.vuetifyjs.com')
    console.log('Github: https://github.com/vuetifyjs/vuetify')
    console.log('Support Vuetify: https://github.com/sponsors/johnleider')
  })
  .catch((err) => {
    console.error(`\n${red('✖')} ${err}\n`)
    process.exit()
  })
