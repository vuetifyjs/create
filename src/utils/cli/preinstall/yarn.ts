import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'

const templateToAppend = `
packageExtensions:
  unplugin-vue-router@*:
    dependencies:
      "@vue/compiler-sfc": "*"
`

export function yarnFile (root: string) {
  const pnpmVersion = execSync(`cd ${root} && yarn -v`, { encoding: 'utf8' }).trim()
  const [major] = pnpmVersion.split('.').map(Number)
  if (major && major >= 2) {
    appendFileSync(resolve(root, '.yarnrc.yml'), templateToAppend)
  }
}

export default function yarn (root: string) {
  yarnFile(root)
}
