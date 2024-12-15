import { useThemeConfig } from 'nextra-theme-docs'
import { useData } from 'nextra/hooks'
import Markdown from 'react-markdown'
import {
  formatCode,
  formatPropertyDescription,
  formatFunctionType,
} from '#/components/typography/utils'
import { API, TypeEnum } from '#/input/graphique/api'
import { ApiItemKind } from '../constants'

const GG = 'GG'

export const useGetData = () => {
  const { components } = useThemeConfig()
  const { docs }: { docs: API } = useData()

  // console.log({ graphiqueDocs: docs })

  const topLevelData = docs.functions.find((f) => f.name === GG)!
  const prop = topLevelData.signatures[0].parameters[0].type.name

  const propData = docs.interfaces.find((int) => int.name === prop)!
  const propTableData = {
    name: propData.name,
    kindLabel: formatCode(ApiItemKind.INTERFACE),
    data: propData?.properties?.map((d) => ({
      name: formatCode(d.optional ? `${d.name}?` : d.name),
      description: formatPropertyDescription({
        description: d.comment.description,
        typeLabel:
          d.type.kind === 'array' && d.type.type
            ? `${(d.type.type as any).name?.replace(`${prop}.`, '')}[]`
            : d.type.name ?? (d.type.type as TypeEnum) ?? '',
      }),
    })),
  }

  const aesData = docs.interfaces.find((int) => int.name === 'Aes')!
  const aesTableData = {
    name: aesData.name,
    kindLabel: formatCode(ApiItemKind.INTERFACE),
    data: aesData?.properties?.map((d) => ({
      name: formatCode(d.optional ? `${d.name}?` : d.name),
      description: formatPropertyDescription({
        description: d.comment.description,
        typeLabel: d.type.signatures
          ? formatFunctionType({ data: d.type, exclude: aesData.name }).type
              .label
          : d.type.name,
      }),
    })),
  }

  const dataValueData = docs.typeAliases.find((t) => t.name === 'DataValue')

  const summarySrc = topLevelData.comment.description

  return {
    summary: <Markdown components={components}>{summarySrc}</Markdown>,
    apiItems: [
      {
        kind: ApiItemKind.REFERENCE,
        data: formatFunctionType({
          data: topLevelData,
          shouldFormat: true,
        }),
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: propTableData,
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: aesTableData,
      },
      {
        kind: ApiItemKind.REFERENCE,
        data: formatFunctionType({
          data: dataValueData,
          shouldFormat: true,
        }),
      },
    ],
  }
}
