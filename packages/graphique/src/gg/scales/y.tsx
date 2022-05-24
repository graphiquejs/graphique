import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { usePageVisibility } from 'react-page-visibility'
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
  const [{ isFixed }, setScale] = useAtom(yScaleState)
  const [{ yDomain: yZoomDomain }, setZoom] = useAtom(zoomState)
  const isVisible = usePageVisibility()

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
    if (!yZoomDomain?.original && isFixed) {
      setZoom((prev) => ({
        ...prev,
        yDomain: {
          ...prev.yDomain,
          original: domain,
        },
      }))
    }
  }, [setZoom, yZoomDomain?.original, isFixed, isVisible])

  return null
}
