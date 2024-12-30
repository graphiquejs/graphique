import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { fillScaleState } from '../../atoms'
import { VisualEncodingProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure the **fill color** encoding for a visualization's geometry elements.
 *
 * Available configuration options determined by an [`aes.fill`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping and the type of data it returns (e.g. continuous vs. categorical).
 *
 * */
export const ScaleFill = ({
  type,
  domain,
  values,
  reverse,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(fillScaleState)

  useEffect(() => {
    setScale({
      type,
      domain,
      values,
      reverse,
    })
  }, [setScale, type, domain, values, reverse])

  return null
}
