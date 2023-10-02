import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { xScaleState, yScaleState, zoomState } from '../../atoms'

type CustomExtent = (number | undefined)[]

interface CustomExtents {
  customXExtent?: CustomExtent
  customYExtent?: CustomExtent
}

export const useUnZoom = () => {
  const [, setYScale] = useAtom(yScaleState)
  const [, setXScale] = useAtom(xScaleState)

  const [
    { xDomain: xZoomDomain, yDomain: yZoomDomain },
    setZoom,
  ] = useAtom(zoomState)

  const unZoom = useCallback(({ customXExtent, customYExtent }: CustomExtents) => {
    setYScale((prev) => ({
      ...prev,
      domain: customYExtent ?? yZoomDomain?.original,
    }))
    setXScale((prev) => ({
      ...prev,
      domain: customXExtent ?? xZoomDomain?.original,
    }))
    setZoom((prev) => ({
      ...prev,
      xDomain: {
        ...prev.xDomain,
        current: undefined,
      },
      yDomain: {
        ...prev.yDomain,
        current: undefined,
      },
    }))
  }, [
    setYScale,
    setXScale,
    setZoom,
    xZoomDomain?.original,
    yZoomDomain?.original,
  ])

  return unZoom
}