import { API } from '#/input/geom-vline/api'
import { useConfig } from 'nextra-theme-docs'
import { ApiItemKind } from '#/utils/constants'
import { useData } from 'nextra/hooks'
import { formatFunctionType } from '#/components/typography/utils'
import { getGeomPropTableData } from '#/utils/getGeomPropTableData'

export const useGetData = () => {
  const { title } = useConfig()
  const { docs }: { docs: API } = useData()

  const geomData = docs.functions.find(
    (f) => f.name.replace('Geom', '').toLowerCase() === title.toLowerCase(),
  )!

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
    ],
  }
}
