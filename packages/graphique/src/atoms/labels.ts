import { atom } from 'jotai'

export interface LabelsProps {
  header?: React.ReactNode
  x?: React.ReactNode | null
  y?: React.ReactNode | null
}

export const labelsState = atom<LabelsProps>({
  header: '',
  x: '',
  y: '',
})
