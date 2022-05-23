import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { yScaleState, zoomState } from '../../atoms'
import { XYScaleProps } from '../../atoms/scales/types'

export const ScaleY = ({
  type,
  format,
  numTicks,
  domain,
  reverse,
  highlightOnFocus,
  className,
}: XYScaleProps) => {
  const [{ domain: givenDomain }, setScale] = useAtom(yScaleState)
  const [{ yDomain: yZoomDomain }, setZoom] = useAtom(zoomState)

  useEffect(() => {
    setScale((prev) => ({
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
    setScale,
    type,
    format,
    numTicks,
    domain,
    reverse,
    highlightOnFocus,
    className,
  ])

  useEffect(() => {
    if (!yZoomDomain?.original) {
      setZoom((prev) => ({
        ...prev,
        yDomain: {
          ...prev.yDomain,
          original: givenDomain,
        },
      }))
    }
  }, [setZoom, givenDomain, yZoomDomain?.original])

  return null
}
