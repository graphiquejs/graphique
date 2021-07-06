import { useEffect } from "react"
import { useAtom } from "jotai"
import { strokeScaleState } from "../../atoms"
import { VisualEncodingProps } from "../../atoms/scales/types"

export const ScaleStroke = ({
  type,
  domain,
  values,
  reverse,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(strokeScaleState)

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
