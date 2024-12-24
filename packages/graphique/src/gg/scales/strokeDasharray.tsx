import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { strokeDasharrayState } from '../../atoms'
import { VisualEncodingProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure the **stroke pattern** encoding for a visualization's geometry elements.
 *
 * Available configuration options determined by an [`aes.strokeDasharray`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping.
 *
 * */
export const ScaleStrokeDasharray = ({
  domain,
  values,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(strokeDasharrayState)

  useEffect(() => {
    setScale({
      domain,
      values,
    })
  }, [setScale, domain, values])

  return null
}
