import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

import { deepMerge } from './deepMerge'

function mergePkg (source: string, destination: string) {
  const target = JSON.parse(readFileSync(destination, 'utf8'))
  const src = JSON.parse(readFileSync(source, 'utf8'))
  const mergedPkg = deepMerge(target, src)

  const keysToSort = ['devDependencies', 'dependencies']
  for (const k of keysToSort) {
    mergedPkg[k] = Object.keys(mergedPkg[k]).toSorted().reduce((a: { [key: string]: string }, c) => (a[c] = mergedPkg[k][c], a), {})
  }

  writeFileSync(destination, JSON.stringify(mergedPkg, null, 2) + '\n')
}

function renderDirectory (source: string, destination: string) {
  mkdirSync(destination, { recursive: true })

  for (const path of readdirSync(source)) {
    renderTemplate(resolve(source, path), resolve(destination, path))
  }
}

function renderFile (source: string, destination: string) {
  const filename = basename(source)

  if (filename.startsWith('_')) {
    destination = resolve(dirname(destination), filename.replace('_', '.'))
  }
  if (filename === 'package.json') {
    mergePkg(source, destination)
  } else {
    copyFileSync(source, destination)
  }
}

function renderTemplate (source: string, destination: string) {
  if (statSync(source).isDirectory()) {
    renderDirectory(source, destination)
  } else {
    renderFile(source, destination)
  }
}

export { renderTemplate }
