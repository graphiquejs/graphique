export const elongate = (
  data: any,
  keyName: string,
  valName: string,
  exclude: string[]
) => {
  let longer: { [key: string]: any } = []
  data.forEach((d: any) => {
    const keys = Object.keys(d).filter(k => !exclude.includes(k))
    const keepAsIs = Object.keys(d).reduce((object: any, key) => {
      if (exclude.includes(key)) {
        object[key] = d[key]
      }
      return object
    }, {})
    keys.forEach(k => {
      let out: { [key: string]: any } = {}
      out[keyName] = k
      out[valName] = d[k]
      longer.push({ ...out, ...keepAsIs })
    })
  })
  return longer
}
