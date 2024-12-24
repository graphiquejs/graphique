import React from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

export const nodeToString = (node: React.ReactNode) => {
  const div = document.createElement('div')
  const root = createRoot(div)
  flushSync(() => root.render(node))
  return div.innerText
}
