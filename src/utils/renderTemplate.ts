import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { basename, dirname, extname, resolve } from 'node:path'

import { deepMerge } from './deepMerge'

function mergePkg (source: string, destination: string) {
  const target = existsSync(destination) ? JSON.parse(readFileSync(destination, 'utf8')) : {}
  const src = JSON.parse(readFileSync(source, 'utf8'))
  const mergedPkg = deepMerge(target, src)

  const keysToSort = ['devDependencies', 'dependencies']
  for (const k of keysToSort) {
    if (mergedPkg[k]) {
      mergedPkg[k] = Object.keys(mergedPkg[k]).toSorted().reduce((a: { [key: string]: string }, c) => (a[c] = mergedPkg[k][c], a), {})
    }
  }

  writeFileSync(destination, JSON.stringify(mergedPkg, null, 2) + '\n')
}

export type RenderOptions = {
  replace?: Record<string, string>
}

function renderDirectory (source: string, destination: string, options?: RenderOptions) {
  mkdirSync(destination, { recursive: true })

  for (const path of readdirSync(source)) {
    renderTemplate(resolve(source, path), resolve(destination, path), options)
  }
}

const binaryExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg'])

function renderFile (source: string, destination: string, options?: RenderOptions) {
  const filename = basename(source)

  if (filename.startsWith('_')) {
    destination = resolve(dirname(destination), filename.replace('_', '.'))
  }

  if (filename === 'package.json') {
    mergePkg(source, destination)
    return
  }

  if (options?.replace && !binaryExtensions.has(extname(filename))) {
    let content = readFileSync(source, 'utf8')
    for (const [key, value] of Object.entries(options.replace)) {
      content = content.replaceAll(key, value)
    }
    writeFileSync(destination, content)
    return
  }

  copyFileSync(source, destination)
}

function renderTemplate (source: string, destination: string, options?: RenderOptions) {
  if (statSync(source).isDirectory()) {
    renderDirectory(source, destination, options)
  } else {
    renderFile(source, destination, options)
  }
}

export { renderTemplate }
