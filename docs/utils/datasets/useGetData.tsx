import {
  formatCode,
  formatPropertyDescription,
  formatUnion,
} from '#/components/typography/utils'
import { API } from '#/input/datasets/api'
import { useThemeConfig, useConfig } from 'nextra-theme-docs'
import { useData } from 'nextra/hooks'
import Markdown from 'react-markdown'
import { ApiItemKind } from '../constants'

export const useGetData = () => {
  const { components } = useThemeConfig()
  const { title } = useConfig()
  const { docs }: { docs: API } = useData()

  const variableInfo = docs.variables.find((v) => v.name === title)!

  const variableData = {
    name: variableInfo.name,
    type:
      variableInfo.type.kind === 'array'
        ? { label: formatCode(`${variableInfo.type.type.name}[]`) }
        : { label: undefined },
  }

  const interfaceData = docs.interfaces.find(
    (int) => int.source.path === title,
  )!

  const interfaceTableData = {
    name: interfaceData.name,
    kindLabel: formatCode(ApiItemKind.INTERFACE),
    data: interfaceData.properties.map((d) => ({
      name: formatCode(d.name),
      description: formatPropertyDescription({
        description: d.comment.description ?? '',
        typeLabel:
          d.type.kind === 'union'
            ? formatUnion(d.type.types!)
            : d.type.type ?? '',
      }),
    })),
  }

  console.log({
    docs,
    variableData,
    interfaceTableData,
  })

  const summary = (
    <Markdown components={components}>
      {variableInfo.comment.description}
    </Markdown>
  )

  const apiItems: {
    kind: ApiItemKind
    data: typeof variableData | typeof interfaceTableData
  }[] = [
    {
      kind: ApiItemKind.REFERENCE,
      data: variableData,
    },
    {
      kind: ApiItemKind.INTERFACE,
      data: interfaceTableData,
    },
  ]

  return {
    summary,
    apiItems,
  }
}
