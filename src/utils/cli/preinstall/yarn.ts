import { x } from 'tinyexec'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'

const templateToAppend = `
packageExtensions:
  unplugin-vue-router@*:
    dependencies:
      "@vue/compiler-sfc": "*"
`

export async function yarnFile (root: string) {
  const pnpmVersion = (await (x('yarn', ['-v'], { nodeOptions: { cwd: root } }))).stdout.trim()
  const [major] = pnpmVersion.split('.').map(Number)
  if (major && major >= 2) {
    appendFileSync(resolve(root, '.yarnrc.yml'), templateToAppend)
  }
}

export default async function yarn (root: string) {
  yarnFile(root)
}
