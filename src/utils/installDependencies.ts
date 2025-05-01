import { installDependencies as installDependencies$1 } from 'nypm'
import { pnpm } from './cli/postinstall'
import { yarn } from './cli/preinstall'

const userAgent = process.env.npm_config_user_agent ?? ''

export const packageManager = /bun/.test(userAgent)
  ? 'bun'
  : 'pnpm'

export async function installDependencies (root: string = process.cwd(), manager: 'npm' | 'pnpm' | 'yarn' | 'bun' = packageManager) {
  if (manager === 'yarn') {
    await yarn(root)
  }
  await installDependencies$1({
    packageManager: manager,
    cwd: root,
    silent: true,
  })
    .catch(() => {
      console.error(
        `Failed to install dependencies using ${manager}.`,
      )
    })
  if (manager === 'pnpm') {
    await pnpm(root)
  }
}
