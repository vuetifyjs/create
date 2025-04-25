import { execSync } from 'node:child_process'

export function pnpmIgnored (root: string) {
  const pnpmVersion = execSync(`cd ${root} && pnpm -v`, { encoding: 'utf8' }).trim()
  const [major] = pnpmVersion.split('.').map(Number)
  if (major && major >= 10) {
    const detect = execSync(`cd ${root} && pnpm ignored-builds`, { encoding: 'utf8' })
    if (detect.startsWith('Automatically ignored builds during installation:\n  None')) return
    return detect
  }
}

export default function pnpm (root: string) {
  const detect = pnpmIgnored(root)
  if (detect) console.warn(detect)
}