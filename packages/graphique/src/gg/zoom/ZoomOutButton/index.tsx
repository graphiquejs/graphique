import React, { MouseEventHandler, useCallback, useState } from 'react'
import { Portal } from './Portal'
import {
  background,
  color,
  defaultStyles,
  containerStyles,
  focusBackground,
  focusColor,
} from './styles'

interface Props {
  x: number
  y: number
  onClick: MouseEventHandler<HTMLButtonElement>
  isBrushing: boolean
  id?: string
}

const SIZE = 28

export const ZoomOutButton = ({ x, y, onClick, isBrushing, id }: Props) => {
  const [isFocused, setIsFocused] = useState(false)
  const handleFocus = useCallback(() => {
    setIsFocused((prev) => !prev)
  }, [setIsFocused])
  const handleUnfocus = useCallback(() => setIsFocused(false), [setIsFocused])

  return (
    <Portal id={id}>
      <div
        style={{
          position: 'absolute',
          left: x - SIZE - 2,
          bottom: y - SIZE - 8,
          width: SIZE,
          height: SIZE,
          pointerEvents: isBrushing ? 'none' : undefined,
        }}
      >
        <button
          type="button"
          aria-label="zoom out"
          style={{
            ...defaultStyles,
            background: isFocused ? focusBackground : background,
            color: isFocused ? focusColor : color,
          }}
          onClick={onClick}
          onMouseOver={handleFocus}
          onMouseOut={handleUnfocus}
          onFocus={handleFocus}
          onBlur={handleUnfocus}
        >
          <div style={containerStyles}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={SIZE - 10}
              height={SIZE - 10}
              viewBox={`0 0 ${SIZE - 4} ${SIZE - 4}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </button>
      </div>
    </Portal>
  )
}
