import {
  formatCode,
  formatFunctionType,
  formatPropertyDescription,
  formatTuple,
  formatUnion,
} from '#/components/typography/utils'
import { Interface } from '#/input/geom-line/api'
import { ApiItemKind } from './constants'

export const getPropTableData = (docs: any, f?: any) => {
  const prop = f?.parameters[0].type.name

  const propData: any = docs.interfaces.find(
    (int: Interface) => int.name === prop,
  )!

  const propTableData = {
    name: propData.name,
    kindLabel: formatCode(ApiItemKind.INTERFACE),
    data: propData?.properties?.map((d: any) => {
      const isArray = d.type.kind === 'array' && d.type.type
      const isFunction = d.type.signatures
      const isUnion = d.type.kind === 'union' && d.type.types
      const isTuple = d.type.kind === 'tuple' && d.type.types

      let typeLabel: string
      if (isArray) {
        const nestedType = d.type.type
        const isArrayUnion = nestedType?.kind === 'union'
        const isArrayTuple = nestedType?.kind === 'tuple'

        let arrayString: string

        if (isArrayTuple) {
          arrayString = formatTuple(nestedType.types)
        } else if (isArrayUnion) {
          arrayString = `(${formatUnion(nestedType.types!)})`
        } else {
          arrayString =
            nestedType.name?.replace(`${prop}.`, '') ?? nestedType.type
        }

        typeLabel = `${arrayString}[]`
      } else if (isFunction)
        typeLabel = formatFunctionType({ data: d.type, exclude: prop })?.type
          ?.label
      else if (isUnion) typeLabel = formatUnion(d.type.types!)
      else if (isTuple) typeLabel = formatTuple(d.type.types)
      else typeLabel = d.type.name ?? (d.type.type as string) ?? ''

      return {
        name: formatCode(d.optional ? `${d.name}?` : d.name),
        description: formatPropertyDescription({
          description: d.comment.description,
          typeLabel,
        }),
      }
    }),
  }

  return propTableData
}
