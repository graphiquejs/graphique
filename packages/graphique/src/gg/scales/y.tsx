import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { yScaleState, zoomState } from '../../atoms'
import { XYScaleProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure a visualization's **y axis** and the **vertical** position of geometry elements in 2D space.
 *
 * Available configuration options determined by an [`aes.y`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping and the type of data it returns (e.g. continuous vs. categorical).
 *
 * */
export const ScaleY = ({
  type,
  format,
  numTicks,
  domain,
  reverse,
  highlightOnFocus,
  focusedTicks,
  className,
}: XYScaleProps) => {
  const [, setScale] = useAtom(yScaleState)
  const [, setZoom] = useAtom(zoomState)

  useEffect(() => {
    setScale((prev) => ({
      ...prev,
      type,
      format,
      numTicks: numTicks || prev.numTicks,
      domain,
      reverse,
      highlightOnFocus,
      focusedTicks,
      className,
      isFixed: !!domain,
    }))
  }, [
    setScale,
    type,
    format,
    numTicks,
    domain,
    reverse,
    highlightOnFocus,
    focusedTicks,
    className,
  ])

  useEffect(() => {
    setZoom((prev) => ({
      ...prev,
      yDomain: {
        ...prev.yDomain,
        original: domain,
      },
    }))
  }, [setZoom, domain])

  return null
}
