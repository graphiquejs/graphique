import { useConfig } from 'nextra-theme-docs'
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
  const { frontMatter } = useConfig()

  const geomData = docs.functions.find(
    (f: any) => f.name.replace('Geom', '').toLowerCase() === frontMatter.slug,
  )!

  let legendApiItems: any[] = []

  if (includeLegend) {
    const legendData = docs.functions.find((f: any) => f.name === 'Legend')!

    legendApiItems = [
      {
        kind: ApiItemKind.REFERENCE,
        data: formatFunctionType({
          data: legendData,
          shouldFormat: true,
        }),
      },
      {
        kind: ApiItemKind.INTERFACE,
        data: getGeomPropTableData(docs, legendData.signatures?.[0]),
      },
    ]
  }

  return {
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
