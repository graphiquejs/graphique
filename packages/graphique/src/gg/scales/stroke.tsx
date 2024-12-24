import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { strokeScaleState } from '../../atoms'
import { VisualEncodingProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure the **stroke color** encoding for a visualization's geometry elements.
 *
 * Available configuration options determined by an [`aes.stroke`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping.
 *
 * */
export const ScaleStroke = ({
  type,
  domain,
  values,
  reverse,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(strokeScaleState)

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
