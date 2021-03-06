import { useEffect } from "react"
import { useAtom } from "jotai"
import { yScaleState } from "../../atoms"
import { XYScaleProps } from "../../atoms/scales/types"

export const ScaleY = ({
  type,
  format,
  numTicks,
  domain,
  highlightOnFocus,
  className,
}: XYScaleProps) => {
  const [, setScale] = useAtom(yScaleState)

  useEffect(() => {
    setScale(prev => ({
        ...prev,
        type,
        format,
        numTicks: numTicks || prev.numTicks,
        domain,
        highlightOnFocus,
        className,
      }))
  }, [setScale, type, format, numTicks, domain, highlightOnFocus, className])

  return null
}
