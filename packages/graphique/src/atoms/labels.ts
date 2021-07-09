import { atom } from 'jotai'

export interface LabelsProps {
  header?: React.ReactNode
  x?: string | null
  y?: string | null
}

export const labelsState = atom<LabelsProps>({
  header: '',
  x: '',
  y: '',
})
