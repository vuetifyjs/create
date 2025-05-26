import vuetify from 'eslint-config-vuetify'

export default vuetify({
  vue: true,
  perfectionist: {
    import: false,
  },
}, {
  rules: {
    'unicorn/no-process-exit': 'off',
  },
})
