import { atom } from 'jotai'

interface XYDomain {
  original?: any[]
  current?: any[]
}

export interface ZoomProps {
  isZooming?: boolean
  xDomain?: XYDomain
  yDomain?: XYDomain
}

export const zoomState = atom<ZoomProps>({
  isZooming: false
})
