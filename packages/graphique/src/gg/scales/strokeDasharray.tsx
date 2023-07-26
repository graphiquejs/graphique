import { useEffect } from "react"
import { useAtom } from "jotai"
import { strokeDasharrayState } from "../../atoms"
import { VisualEncodingProps } from "../../atoms/scales/types"

export const ScaleStrokeDasharray = ({
  domain,
  values,
}: VisualEncodingProps) => {
  const [, setScale] = useAtom(strokeDasharrayState)

  useEffect(() => {
    setScale({
      domain,
      values,
    })
  }, [setScale, domain, values])

  return null
}
