import { useEffect } from "react"
import { useAtom } from "jotai"
import { radiusScaleState } from "../../atoms"
import { SizeEncodingProps } from "../../atoms/scales/types"

export const ScaleRadius = ({ domain, range }: SizeEncodingProps) => {
  const [, setScale] = useAtom(radiusScaleState)

  useEffect(() => {
    setScale(prev => ({
        ...prev,
        domain: domain || prev.domain,
        range: range || prev.range,
      }))
  }, [setScale, domain, range])

  return null
}
