import React from "react"
import { createPortal } from "react-dom"

type PortalProps = {
  id: string
}

export const XTooltipPortal: React.FC<PortalProps> = ({ children, id }) => {
  const mount = document.getElementById(`__gg-tooltip-x-${id}`)
  return mount ? createPortal(children, mount as Element) : null
}

export const YTooltipPortal: React.FC<PortalProps> = ({ children, id }) => {

  // const mount = document.getElementById(`__gg-tooltip-${id}`)
  // const el = document.createElement("div")

  // useEffect(() => {
  //   mount && mount.appendChild(el)
  //   // return () => {
  //   //   mount && mount.removeChild(el) 
  //   // }
  // }, [mount, el])

  // return createPortal(children, el)

  const mount = document.getElementById(`__gg-tooltip-y-${id}`)
  return mount ? createPortal(children, mount as Element) : null
}
