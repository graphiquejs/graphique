import { atom } from 'jotai'
import { XYScaleProps } from './types'

interface XScaleProps extends XYScaleProps {
  isFixed?: boolean
}

export const xScaleState = atom<XScaleProps>({
  numTicks: (width) => {
    if (width && width < 500) return 3
    if (width < 800) return 6
    return undefined
  },
})
