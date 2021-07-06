import { useEffect } from "react"
import { useAtom } from "jotai"
import { labelsState, LabelsProps } from "../../atoms"

export const Labels = ({ title, x, y }: LabelsProps) => {
  const [, setLabels] = useAtom(labelsState)
  useEffect(() => {
    setLabels({
      title,
      x,
      y,
    })
  }, [setLabels, title, x, y])

  return null
}
