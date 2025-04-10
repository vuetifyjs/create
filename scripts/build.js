import { build } from 'esbuild'

async function bundleMain () {
  await build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.mjs',
    format: 'esm',
    platform: 'node',
    target: 'node18',
    external: ['package-browser-detector', 'magicast', 'validate-npm-package-name', 'kolorist', 'minimist', 'prompts'],
  })
}

async function bundle () {
  await bundleMain()
}

bundle()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
