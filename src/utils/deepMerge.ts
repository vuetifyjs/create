interface DeepMerge {
  (...sources: Array<{ [key: string]: any }>): { [key: string]: any }
}

const isObject: { (key: any): boolean } = (v: unknown): boolean => {
  return (
    v === Object(v) &&
    v !== null &&
    !Array.isArray(v)
  )
}

const deepMerge: DeepMerge = <T extends { [key: string]: any }[]>(...sources: T): { [key: string]: any } =>
  sources.reduce((acc, curr) => {
    Object.keys(curr).forEach((key) => {
      if (Array.isArray(acc[key]) && Array.isArray(curr[key])) {
        acc[key] = Array.from(new Set((acc[key]).concat(curr[key])))
      } else if (isObject(acc[key]) && isObject(curr[key])) {
        acc[key] = deepMerge(acc[key], curr[key])
      } else {
        acc[key] = curr[key]
      }
    })

    return acc
  }, {})

export { deepMerge }
