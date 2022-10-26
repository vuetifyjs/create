import { spawnSync } from 'child_process'

function installDependencies(projectRoot: string, packageManager: 'npm' | 'yarn' | 'pnpm') {
  const cmd = (
    packageManager === 'npm' ?
      'npm install' :
      packageManager === 'yarn' ?
        'yarn' :
        'pnpm install'
  )
  
  const spawn = spawnSync(cmd, {
    cwd: projectRoot,
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: true,
  })

  if (spawn.error) {
    throw spawn.error
  }
}

export { installDependencies }
