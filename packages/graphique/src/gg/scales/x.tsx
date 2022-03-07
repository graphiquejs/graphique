import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { xScaleState } from '../../atoms'
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

  return null
}
