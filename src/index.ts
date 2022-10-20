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

async function run () {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
  })

  type PromptQuestions = 'projectName' | 'canOverwrite' | 'useTypeScript' | 'usePackageManager'

  let context: Answers<PromptQuestions> = {
    projectName: undefined,
    canOverwrite: undefined,
    useTypeScript: argv.typescript,
    usePackageManager: undefined,
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
          message: 'Would you like to install dependencies with yarn or npm?',
          initial: 0,
          choices: [
            { title: 'npm', value: 'npm' },
            { title: 'yarn', value: 'yarn' },
            { title: 'none', value: null },
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
  } = context

  const projectRoot = join(cwd, projectName)

  if (canOverwrite) {
    // Clean dir
    rmSync(projectRoot, { recursive: true })
  }

  mkdirSync(projectRoot)

  const rootPkg = { name: projectName }

  writeFileSync(resolve(projectRoot, 'package.json'), JSON.stringify(rootPkg, null, 2))

  const rootTemplatePath = resolve(cwd, 'template')
  const jsOrTs = useTypeScript || argv.typescript ? 'typescript' : 'javascript'
  const preset = !!argv.preset ? argv.preset : 'default'

  console.log('◌ Generating scaffold...')
  renderTemplate(resolve(rootTemplatePath, jsOrTs, preset), projectRoot)

  if (usePackageManager) {      
    console.log(`\n◌ Installing dependencies with ${usePackageManager}...\n`)
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
    console.error(`${red('✖')} ${err}`)
    process.exit()
  })
