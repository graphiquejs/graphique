import { atom } from 'jotai'

export interface LabelsProps {
  /** An element or string placed above the visualization area — a great place for a title or anything else you'd like */
  header?: React.ReactNode
  /** Used to label the x axis */
  x?: string
  /** An element or string used to label the y axis */
  y?: React.ReactNode
}

export const labelsState = atom<LabelsProps>({
  header: '',
  x: '',
  y: '',
})
