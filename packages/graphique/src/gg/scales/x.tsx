import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { xScaleState, zoomState } from '../../atoms'
import { XYScaleProps } from '../../atoms/scales/types'

export const ScaleX = ({
  type,
  format,
  numTicks,
  domain,
  reverse,
  highlightOnFocus,
  className,
}: XYScaleProps) => {
  const [{ domain: givenDomain, isFixed }, setXScale] = useAtom(xScaleState)
  const [{ xDomain: xZoomDomain }, setZoom] = useAtom(zoomState)

  useEffect(() => {
    setXScale((prev) => ({
      ...prev,
      type,
      format,
      numTicks: numTicks || prev.numTicks,
      domain,
      reverse,
      highlightOnFocus,
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
    className,
  ])

  useEffect(() => {
    if (!xZoomDomain?.original && isFixed) {
      setZoom((prev) => ({
        ...prev,
        xDomain: {
          ...prev.xDomain,
          original: givenDomain,
        },
      }))
    }
  }, [setZoom, givenDomain, xZoomDomain?.original, isFixed])

  return null
}
