import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { labelsState, LabelsProps } from '../../atoms'

export const Labels = ({ header, x, y }: LabelsProps) => {
  const [, setLabels] = useAtom(labelsState)
  useEffect(() => {
    setLabels({
      header,
      x,
      y,
    })
  }, [setLabels, header, x, y])

  return null
}
