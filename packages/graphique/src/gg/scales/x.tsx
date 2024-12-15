import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { xScaleState, zoomState } from '../../atoms'
import { XYScaleProps } from '../../atoms/scales/types'

/**
 * A headless component used to configure a visualization's **x axis** and the **horizontal** position of geometry elements in 2D space.
 *
 * Available configuration options determined by the type of data returned by the [`aes.x`](https://graphique.dev/docs/graphique/gg#Aes) functional mapping (e.g. continuous vs. categorical).
 *
 * */
export const ScaleX = ({
  type,
  format,
  numTicks,
  domain,
  reverse,
  highlightOnFocus,
  focusedTicks,
  className,
}: XYScaleProps) => {
  const [, setXScale] = useAtom(xScaleState)
  const [, setZoom] = useAtom(zoomState)

  useEffect(() => {
    setXScale((prev) => ({
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
    setXScale,
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
      xDomain: {
        ...prev.xDomain,
        original: domain,
      },
    }))
  }, [setZoom, domain])

  return null
}
