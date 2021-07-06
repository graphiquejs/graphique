export const formatMissing = (v: any) => {
  let value
  switch (v) {
    case null:
      value = '[null]'
      break
    case undefined:
      value = '[undefined]'
      break
    default:
      value = v
  }
  return value
}
