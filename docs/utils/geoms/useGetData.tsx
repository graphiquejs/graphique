import { useConfig, useThemeConfig } from 'nextra-theme-docs'
import Markdown from 'react-markdown'
import { ApiItemKind } from '#/utils/constants'
import { formatFunctionType } from '#/components/typography/utils'
import { getGeomPropTableData } from '#/utils/getGeomPropTableData'

export const useGetData = ({
  docs,
  includeLegend = true,
}: {
  docs: any
  includeLegend?: boolean
}) => {
  const { components } = useThemeConfig()
  const { frontMatter } = useConfig()

  const geomData = docs.functions.find(
    (f: any) => f.name.replace('Geom', '').toLowerCase() === frontMatter.slug,
  )!

  const summarySrc = geomData?.comment?.description

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
        data: getGeomPropTableData(docs, ld.signatures?.[0]),
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
          data: geomData,
          shouldFormat: true,
        }),
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: getGeomPropTableData(docs, geomData.signatures?.[0]),
      },
      ...legendApiItems,
    ],
  }
}
