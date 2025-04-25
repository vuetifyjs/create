type GenericObject = { [key: string]: any }
interface DeepMerge {
  (...sources: Array<GenericObject>): GenericObject
}

const isObject: { (key: any): boolean } = (v: unknown): boolean => {
  return (
    v === Object(v)
    && v !== null
    && !Array.isArray(v)
  )
}

const deepMerge: DeepMerge = <T extends GenericObject[]>(...sources: T): GenericObject =>
  sources.reduce((acc, curr) => {
    for (const key of Object.keys(curr)) {
      if (Array.isArray(acc[key]) && Array.isArray(curr[key])) {
        acc[key] = Array.from(new Set((acc[key]).concat(curr[key])))
      } else if (isObject(acc[key]) && isObject(curr[key])) {
        acc[key] = deepMerge(acc[key], curr[key])
      } else {
        acc[key] = curr[key]
      }
    }

    return acc
  }, {})

export { deepMerge }
