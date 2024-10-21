// Node
import process from 'process'
import path from 'path'
import { spawnSync } from 'child_process'
import fs from 'fs'

// Types
import type { PackageJsonEntry } from './types'
import type { AgentCommands, DetectResult } from 'package-manager-detector'

// Utils
import { resolveCommand } from 'package-manager-detector/commands'

export function detectPkgInfo() {
  const userAgent = process.env.npm_config_user_agent
  if (!userAgent)
    return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

export function addPackageObject(
    key: 'scripts' | 'dependencies' | 'devDependencies' | 'overrides' | 'resolutions',
    entry: PackageJsonEntry[],
    pkg: any,
    sort = true,
) {
  pkg[key] ??= {}
  if (!sort) {
    for (const [name, value] of entry)
      pkg[key][name] = value

    return
  }

  const entries = Object.entries(pkg[key])
  pkg[key] = {}
  entry.forEach(([name, value]) => {
    entries.push([name, value])
  })
  entries.sort(([a], [b]) => a.localeCompare(b)).forEach(([k, v]) => {
    pkg[key][k] = v
  })
}

export function runCommand(
  pmDetection: DetectResult | null,
  command: keyof AgentCommands,
  args: string[],
  cwd: string,
) {
  let runCommand = 'npm'
  let runArgs: string[] = [command]

  // run install and prepare
  if (pmDetection) {
    const prepare = resolveCommand(pmDetection.name, command, args)!
    runCommand = prepare.command
    runArgs = prepare.args
  }

  const run = spawnSync(
    runCommand,
    runArgs.filter(Boolean), {
      cwd,
      stdio: ['inherit', 'inherit', 'pipe'],
      shell: true,
    },
  )
  if (run.error) {
    throw run.error
  }
}

export function editFile(file: string, callback: (content: string) => string, destination?: string) {
  const content = fs.readFileSync(file, 'utf-8')
  fs.writeFileSync(destination ?? file, callback(content), 'utf-8')
}

export function getPaths(
  rootPath: string,
  templateDir: string,
  v4: boolean,
): [rootPath: string, templateDir: string] {
  return v4
    ? [path.join(rootPath, 'app'), templateDir]
    : [rootPath, templateDir]
}
