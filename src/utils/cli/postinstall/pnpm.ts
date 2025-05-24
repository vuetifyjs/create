import { x } from 'tinyexec'

export async function pnpmIgnored (root: string) {
  const pnpmVersion = (await x(`pnpm`, ['-v'], { nodeOptions: { cwd: root } })).stdout.trim()
  const [major] = pnpmVersion.split('.').map(Number)
  if (major && major >= 10) {
    const detect = (await x('pnpm', ['ignored-builds'], { nodeOptions: { cwd: root } })).stdout
    if (detect.startsWith('Automatically ignored builds during installation:\n  None')) {
      return
    }
    return detect
  }
}

export default async function pnpm (root: string) {
  const detect = await pnpmIgnored(root)
  if (detect) {
    console.warn(detect)
  }
}
