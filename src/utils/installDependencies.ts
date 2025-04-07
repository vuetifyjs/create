import { installDependencies as installDependencies$1 } from 'nypm'

const userAgent = process.env.npm_config_user_agent ?? ''

export const packageManager = /bun/.test(userAgent)
  ? 'bun'
  : 'pnpm'

export async function installDependencies (root: string = process.cwd(), manager: 'npm' | 'pnpm' | 'yarn' | 'bun' = packageManager) {
  await installDependencies$1({
    packageManager: manager,
    cwd: root,
  }).catch(() => {
    console.error(
      `Failed to install dependencies using ${manager}.`
    )
  })
}
