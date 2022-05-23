import { CSSProperties } from 'react'

const background = '#f0f0f0ee'
const color = '#666'
const focusBackground = '#eaeaeaee'
const focusColor = '#333'

const defaultStyles: CSSProperties = {
  cursor: 'pointer',
  width: 28,
  height: 28,
  background,
  border: '1px solid #ddddddee',
  borderRadius: 3,
  color,
  padding: 2,
  transition: 'background 200ms, color 300ms',
}

const containerStyles: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export {
  background,
  color,
  focusBackground,
  focusColor,
  defaultStyles,
  containerStyles,
}