import React from 'react'
import { createPortal } from 'react-dom'

export const isBetween = (
  value: number | undefined,
  v0: number | undefined,
  v1: number | undefined
) =>
  typeof value !== 'undefined' &&
  typeof v0 !== 'undefined' &&
  typeof v1 !== 'undefined' &&
  value >= Math.min(v0, v1) &&
  value <= Math.max(v0, v1)

export interface BrushCoords {
  x0: number
  x1: number
  y0: number
  y1: number
}

const exclusionFill = '#22222288'
export const ExclusionArea = React.forwardRef(
  (_, ref: React.ForwardedRef<SVGRectElement>) => (
    <rect
      ref={ref}
      fill="transparent"
      style={{
        pointerEvents: 'none',
        fill: exclusionFill,
        transition: 'fill 100ms ease-in-out',
      }}
    />
  )
)

interface PortalProps {
  children?: React.ReactNode
  id?: string
}

export const BrushExclusion = ({ children, id }: PortalProps) => {
  const mount = document.getElementById(`__gg-brush-exclusion-${id}`)
  return mount ? createPortal(children, mount as Element) : null
}
