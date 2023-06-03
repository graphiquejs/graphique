import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { xScaleState, yScaleState, zoomState } from '../../atoms'

export const useUnZoom = () => {
  const [, setYScale] = useAtom(yScaleState)
  const [, setXScale] = useAtom(xScaleState)

  const [
    { xDomain: xZoomDomain, yDomain: yZoomDomain },
    setZoom,
  ] = useAtom(zoomState)

  const unZoom = useCallback(() => {
    setYScale((prev) => ({
      ...prev,
      domain: yZoomDomain?.original,
    }))
    setXScale((prev) => ({
      ...prev,
      domain: xZoomDomain?.original,
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
  }, [setYScale, setXScale, setZoom])

  return unZoom
}