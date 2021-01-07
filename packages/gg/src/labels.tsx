import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { labelsState } from "./"

export type LabelsProps = {
  title?: React.ReactNode
  x?: string | null
  y?: React.ReactNode
  legend?: React.ReactNode
  tooltip?: string
}

const Labels: React.FC<LabelsProps> = ({
  title,
  x,
  y,
  legend,
  tooltip,
}) => {

  const setLabelsState = useSetRecoilState(labelsState)

  useEffect(() => {
    setLabelsState({
      title,
      x,
      y,
      legend,
      tooltip,
    })
  }, [setLabelsState, title, x, y, legend, tooltip])
  
  return null
}

Labels.displayName = "Labels"
export { Labels }