#!/usr/bin/env node

import validate from 'validate-npm-package-name'

import { red } from 'kolorist'

import minimist from 'minimist'
import prompts from 'prompts'

import { resolve, join } from 'path'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { renderTemplate } from './utils'

import type {Answers} from 'prompts'

async function run () {
  const cwd = process.cwd()

  const argv = minimist(process.argv.slice(2), {
    alias: {
      'typescript': ['ts'],
    },
    boolean: true,
  })

  console.log('ARGV: ', argv._[0])

  /**
   * Args:
   *  --force -> force overwrite
   *  --typescript, --ts => typescript project
   *  --
   */

  // needsTypeScript?: boolean
  // needsJsx?: boolean
  // needsRouter?: boolean
  // needsPinia?: boolean
  // needsEslint?: boolean
  // needsPrettier?: boolean

  // needsVitest?: boolean
  // needsCypress?: boolean

  type PromptQuestions = 'projectName' | 'canOverwrite' | 'useEslint' | 'useJsx' | 'useTypeScript' | 'usePinia' | 'useRouter'

  let context: Answers<PromptQuestions> = {
    projectName: undefined,
    canOverwrite: undefined,
    useEslint: undefined,
    useJsx: undefined,
    usePinia: undefined,
    useRouter: undefined,
    useTypeScript: undefined,
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
            console.log(existsSync(projectPath))
            return (
              !existsSync(projectPath) || readdirSync(projectPath).length === 0
            ) ? null : 'toggle'
          },
          message: prev => `Create project at ${resolve(cwd, prev)}?`,
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
          name: 'useJsx',
          type: 'toggle',
          message: 'Use Jsx?',
          active: 'Yes',
          inactive: 'No',
          initial: false,
        },
        {
          name: 'useRouter',
          type: 'toggle',
          message: 'Use Vue-Router?',
          active: 'Yes',
          inactive: 'No',
          initial: false,
        },
      ],
      {
        onCancel: () => {
          console.error('Operation cancelled')
          throw new Error(red('✖') + ' Operation cancelled')
        },
        onSubmit: (prompt, answer, answers) => {},
      },
    )
  } catch (err) {
    console.error(err)
  }

  console.log(context)

  const {
    canOverwrite,
    projectName,
    useEslint,
    useJsx,
    usePinia,
    useRouter,
    useTypeScript,
  } = { ...context }

  const root = join(cwd, projectName)

  if (existsSync(root)) {
    // Clean dir
  } else {
    mkdirSync(root)
  }

  console.log('Generating project...')

  const rootPkg = { name: projectName, version: '0.0.0' }

  writeFileSync(resolve(root, 'package.json'), JSON.stringify(rootPkg, null, 2))

  const rootTemplatePath = resolve(cwd, 'template')
  console.log('root template path: ', rootTemplatePath)
  console.log('CWD: ', cwd)
  console.log('dirname: ', __dirname)

  renderTemplate(resolve(rootTemplatePath, 'base'), root)
}

run().catch(e => { console.error(e) }) // process.exit(1)
