import { useConfig, useThemeConfig } from 'nextra-theme-docs'
import Markdown from 'react-markdown'
import { ApiItemKind } from '#/utils/constants'
import { formatFunctionType } from '#/components/typography/utils'
import { getPropTableData } from '#/utils/getPropTableData'

export const useGetData = ({
  docs,
  includeLegend = false,
}: {
  docs: any
  includeLegend?: boolean
}) => {
  const { components } = useThemeConfig()
  const { frontMatter } = useConfig()

  const mainData = docs.functions.find(
    (f: any) => f.name.replace('Geom', '').toLowerCase() === frontMatter.slug,
  )!

  const summarySrc = mainData?.comment?.description

  let legendApiItems: any[] = []

  if (includeLegend) {
    const legendData = docs.functions.filter((f: any) =>
      String(f.name).includes('Legend'),
    )!

    legendApiItems = legendData.flatMap((ld: any) => [
      {
        kind: ApiItemKind.REFERENCE,
        data: formatFunctionType({
          data: ld,
          shouldFormat: true,
        }),
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: getPropTableData(docs, ld.signatures?.[0]),
      },
    ])
  }

  return {
    summary: summarySrc ? (
      <Markdown components={components}>{summarySrc}</Markdown>
    ) : undefined,
    apiItems: [
      {
        kind: ApiItemKind.REFERENCE,
        data: formatFunctionType({
          data: mainData,
          shouldFormat: true,
        }),
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: getPropTableData(docs, mainData.signatures?.[0]),
      },
      ...legendApiItems,
    ],
  }
}
