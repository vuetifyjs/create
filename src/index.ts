#!/usr/bin/env node

import validate from 'validate-npm-package-name'

import { red } from 'kolorist'

import minimist from 'minimist'
import prompts from 'prompts'

import { resolve, join } from 'path'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { installDependencies, renderTemplate } from './utils'

// Types
import type { Answers } from 'prompts'

async function run () {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
    boolean: true,
  })

  type PromptQuestions = 'projectName' | 'canOverwrite' | 'useTypeScript' | 'useRouter' | 'useStore' | 'useYarnOrNpm'

  let context: Answers<PromptQuestions> = {
    projectName: undefined,
    canOverwrite: undefined,
    useTypeScript: false,
    useRouter: false,
    useStore: false,
    useYarnOrNpm: false,
  }

  try {
    context = await prompts<PromptQuestions>([
        {
          name: 'projectName',
          type: 'text',
          message: 'Project name:',
          initial: 'vuetify-project',
          validate: v => {
            const { validForNewPackages, validForOldPackages, errors, warnings } = validate(String(v).trim())
            if (errors !== undefined || warnings !== undefined) {
              if (warnings) console.warn('\n' + 'ERROR: ' + warnings?.join('\n'))
              if (errors) console.error('\n' + 'ERROR: ' + errors?.join('\n'))
              console.error('Exiting process...')
              process.exit()
            } else {
              return true
            }
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
              !existsSync(projectPath) || readdirSync(projectPath).length === 0
            ) ? null : 'toggle'
          },
          message: prev => `The project path: ${resolve(cwd, prev)} already exists, would you like to overwrite this directory?`,
        },
        {
          name: 'useTypeScript',
          type: 'toggle',
          message: 'Use TypeScript?',
          active: 'Yes',
          inactive: 'No',
          initial: false,
        },
        {
          name: 'useStore',
          type: 'toggle',
          message: 'Use Pinia?',
          active: 'Yes',
          inactive: 'No',
          initial: false,
        },
        {
          name: 'useYarnOrNpm',
          type: 'multiselect',
          message: 'Would you like to install dependencies with yarn or npm?',
          max: 1,
          min: 1,
          // instructions: false,
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
        onSubmit: (prompt, answer, answers) => {},
      },
    )
  } catch (err) {
    console.error(err)
    process.exit()
  }

  const {
    canOverwrite,
    projectName,
    useTypeScript,
    useStore,
    useYarnOrNpm,
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
  const jsOrTs = useTypeScript ? 'typescript' : 'javascript'

  renderTemplate(resolve(rootTemplatePath, jsOrTs, 'default'), projectRoot)

  if (useStore) {
    renderTemplate(resolve(rootTemplatePath, jsOrTs, 'pinia'), projectRoot)
  }

  if (useYarnOrNpm) {
    installDependencies(projectRoot, useYarnOrNpm)
  }
}

run()
  .then(() => {
    console.log('Discord community: https://community.vuetifyjs.com')
    console.log('Github: https://github.com/vuetifyjs/vuetify')
    console.log('Support Vuetify: https://github.com/sponsors/johnleider')
  })
  .catch(e => {
    console.error(e)
    process.exit()
  })
