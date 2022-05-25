import { atom } from 'jotai'

interface XYDomain {
  original?: any[]
  current?: any[]
}

type ZoomDomain = {
  x?: any[]
  y?: any[]
}

export interface ZoomProps {
  xDomain?: XYDomain
  yDomain?: XYDomain
  onZoom?: (domain: ZoomDomain) => void
  onUnzoom?: () => void
}

export interface ZoomSettings {
  xDomain?: any[]
  yDomain?: any[]
  onZoom?: (domain?: ZoomDomain) => void
  onUnzoom?: () => void
}

export const zoomState = atom<ZoomProps>({})
