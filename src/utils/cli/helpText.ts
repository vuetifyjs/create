import pkg from '../../../package.json' with { type: 'json' }

export function getHelpText (): string {
  return `
Usage: create-vuetify [project-name] [options]

Options:
  -p, --preset <preset>              Choose a preset (base, default, essentials, nuxt-base, nuxt-default, nuxt-essentials)
  --ts, --typescript                 Use TypeScript
  --pm, --package-manager <manager>  Package manager to use (npm, pnpm, yarn, bun, none)
  -i, --install                      Install dependencies
  -f, --force, --overwrite           Overwrite existing directory
  --nuxt-module                      Use vuetify-nuxt-module (for Nuxt presets)
  --nuxt-ssr, --ssr                  Enable Nuxt SSR (for Nuxt presets)
  --nuxt-ssr-client-hints            Enable Nuxt SSR Client Hints (for Nuxt presets)
  --v4                               Use Vuetify 4 (Beta)
  -h, --help                         Show help
  -v, --version                      Show version

Examples:
  create-vuetify                                          # Interactive mode
  create-vuetify my-app --preset default --typescript     # Non-interactive with TypeScript
  create-vuetify my-app --preset nuxt-essentials --ssr    # Nuxt project with SSR
  create-vuetify my-app --force --install --pm pnpm       # Force overwrite and install with pnpm

Presets:
  default      - Barebones (Only Vue & Vuetify)
  base         - Default (Adds routing, ESLint & SASS variables)
  essentials   - Recommended (Everything from Default. Adds auto importing, layouts & pinia)
  nuxt-base    - Nuxt Default (Adds Nuxt ESLint & SASS variables)
  nuxt-default - Nuxt Barebones (Only Vuetify)
  nuxt-essentials - Nuxt Recommended (Everything from Default. Enables auto importing & layouts)
`.trim()
}

export function getVersionText (): string {
  return `${pkg.version}`
}
