import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { radiusScaleState } from '../../atoms'
import { SizeEncodingProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure the **radius size** encoding for a visualization's GeomPoint elements.
 *
 * Available configuration options determined by an [`aes.size`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping.
 *
 * */
export const ScaleRadius = ({ domain, range }: SizeEncodingProps) => {
  const [, setScale] = useAtom(radiusScaleState)

  useEffect(() => {
    setScale((prev) => ({
      ...prev,
      domain: domain || prev.domain,
      range: range || prev.range,
    }))
  }, [setScale, domain, range])

  return null
}
