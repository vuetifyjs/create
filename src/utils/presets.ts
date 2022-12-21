const defaultContext = {
  useEslint: false,
  useRouter: false,
  useStore: false,
}

const baseContext = {
  ...defaultContext,
  useEslint: true,
  useRouter: true,
}

const essentialsContext = {
  ...baseContext,
  useStore: true,
}

const presets = {
  base: baseContext,
  default: defaultContext,
  essentials: essentialsContext,
}

export { presets }
