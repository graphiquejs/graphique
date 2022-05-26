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
