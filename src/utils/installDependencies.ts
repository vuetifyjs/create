import { spawnSync } from 'child_process'

function installDependencies(projectRoot: string, npmOrYarn: 'npm' | 'yarn') {
  const cmd = npmOrYarn === 'npm' ? 'npm install' : 'yarn'
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
