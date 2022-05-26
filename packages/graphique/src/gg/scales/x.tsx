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

  // useEffect(() => {
  //   if (!xZoomDomain?.original && isFixed) {
  //     setZoom((prev) => ({
  //       ...prev,
  //       xDomain: {
  //         ...prev.xDomain,
  //         original: givenDomain,
  //       },
  //     }))
  //   }
  // }, [setZoom, givenDomain, xZoomDomain?.original, isFixed])

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
