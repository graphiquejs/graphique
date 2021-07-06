export const elongate = (
  data: { [key: string]: any }[],
  keyName: string,
  valName: string,
  exclude: string[]
) => {
  const longer: any[] = []
  data.forEach((d) => {
    const keys = Object.keys(d).filter((k) => !exclude.includes(k))
    const keepAsIs = Object.keys(d).reduce((object: any, key) => {
      const newObj = object
      if (exclude.includes(key)) {
        newObj[key] = d[key]
      }
      return newObj
    }, {})
    keys.forEach((k) => {
      const out: { [key: string]: any } = {}
      out[keyName] = k
      out[valName] = d[k]
      longer.push({ ...out, ...keepAsIs })
    })
  })
  return longer
}
