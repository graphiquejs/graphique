import { atom } from 'jotai'
import { XYScaleProps } from './types'

export const xScaleState = atom<XYScaleProps>({
  numTicks: (width) => {
    if (width && width < 500) return 3
    if (width < 800) return 6
    return undefined
  },
})
