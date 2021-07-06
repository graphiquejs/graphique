import { atom } from "jotai"

export interface LabelsProps {
  title?: React.ReactNode
  x?: string | null
  y?: string | null
}

export const labelsState = atom<LabelsProps>({
  title: "",
  x: "",
  y: "",
})
