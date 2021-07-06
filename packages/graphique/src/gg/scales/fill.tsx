import { useEffect } from "react"
import { useAtom } from "jotai"
import { fillScaleState } from "../../atoms"
import { VisualEncodingProps } from "../../atoms/scales/types"

export const ScaleFill = ({
  type,
  domain,
  values,
  reverse,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(fillScaleState)

  useEffect(() => {
    setScale({
      type,
      domain,
      values,
      reverse,
    })
  }, [setScale, type, domain, values, reverse])

  return null
}
