import { CSSProperties } from 'react'

interface FocusProps {
  nodes: HTMLCollectionOf<SVGElement>
  focusedIndex: number | number[]
  focusedStyles: CSSProperties
  unfocusedStyles: CSSProperties
}

interface UnfocusProps {
  nodes: HTMLCollectionOf<SVGElement>
  baseStyles: CSSProperties
}

export const focusNodes = ({
  nodes,
  focusedIndex,
  focusedStyles,
  unfocusedStyles,
}: FocusProps) => {
  const styleNodes = nodes

  const focusedIndices = [focusedIndex].flat()

  const toUnfocus = Array.from(nodes).filter(
    (_, ind) => !focusedIndices.includes(ind)
  )

  toUnfocus.forEach((node) => {
    const styleNode = node
    Object.entries(unfocusedStyles).forEach(([key, val]) => {
      styleNode.style[key as any] = val as string
    })
  })

  Object.entries(focusedStyles).forEach(([key, val]) => {
    focusedIndices.forEach((ind) => {
      styleNodes[ind].style[key as any] = val as string
    })
  })
}

export const unfocusNodes = ({ nodes, baseStyles }: UnfocusProps) => {
  Array.from(nodes).forEach((node) => {
    const styleNode = node
    Object.entries(baseStyles).forEach(([key, val]) => {
      styleNode.style[key as any] = val as string
    })
  })
}
