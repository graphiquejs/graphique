import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { zoomState, ZoomSettings, xScaleState, yScaleState } from '../../atoms'

export const Zoom = ({ onZoom, onUnzoom, xDomain, yDomain }: ZoomSettings) => {
  const [, setZoom] = useAtom(zoomState)
  const [, setXScale] = useAtom(xScaleState)
  const [, setYScale] = useAtom(yScaleState)

  useEffect(() => {
    setZoom((prev) => ({
      ...prev,
      xDomain: {
        ...prev.xDomain,
        current: xDomain ?? prev?.xDomain?.current,
      },
      yDomain: {
        ...prev.yDomain,
        current: yDomain ?? prev?.yDomain?.current,
      },
      onZoom,
      onUnzoom,
    }))

    setXScale((prev) => ({
      ...prev,
      domain: xDomain ?? prev.domain,
    }))

    setYScale((prev) => ({
      ...prev,
      domain: yDomain ?? prev.domain,
    }))
  }, [onZoom, onUnzoom, xDomain, yDomain])

  return null
}
