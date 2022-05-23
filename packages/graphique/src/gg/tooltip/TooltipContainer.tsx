import React, { CSSProperties } from 'react'

const styles: CSSProperties = {
  fontSize: 12,
  padding: '4px 6px 4px 6px',
  color: '#111',
  background: '#fefefee9',
  border: '1px solid #eee',
  borderRadius: 2,
  boxShadow: 'rgba(0, 0, 0, 0.5) 0px 1px 4px',
}

export interface TooltipContainerProps {
  children?: React.ReactNode
  style?: CSSProperties
}

export const TooltipContainer = ({
  children,
  style,
}: TooltipContainerProps) => (
  <div
    style={{
      ...styles,
      ...style,
    }}
  >
    {children}
  </div>
)
