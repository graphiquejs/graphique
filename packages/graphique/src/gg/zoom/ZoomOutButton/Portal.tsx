import React from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children?: React.ReactNode
  id?: string
}

export const Portal = ({ children, id }: PortalProps) => {
  const mount = document.getElementById(`__gg-zoom-out-button-${id}`)
  return mount ? createPortal(children, mount as Element) : null
}
