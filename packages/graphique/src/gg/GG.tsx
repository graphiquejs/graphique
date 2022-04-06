import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from 'react'
import { Provider } from 'jotai'
import { generateID, debounce } from '../util'
import { GGBase } from './GGBase'
import { RootGGProps } from './types/GG'

export const GG = ({ children, ...props }: RootGGProps) => {
  const { data, aes, width, height, margin, isContainerWidth } = { ...props }
  const ggRef = useRef<HTMLDivElement>(null)

  const [ggWidth, setGGWidth] = useState(
    isContainerWidth ? ggRef.current?.clientWidth : width
  )

  useLayoutEffect(() => {
    if (isContainerWidth) setGGWidth(ggRef.current?.clientWidth)
  }, [isContainerWidth])

  useEffect(() => {
    const resize = debounce(80, () => setGGWidth(ggRef.current?.clientWidth))
    if (isContainerWidth) {
      window.addEventListener('resize', resize)
    }
    return () => window.removeEventListener('resize', resize)
  }, [isContainerWidth])

  const id = useMemo(() => generateID(), [])

  return (
    <div ref={ggRef}>
      <Provider>
        <GGBase
          data={data}
          aes={aes}
          width={ggWidth}
          height={height}
          margin={margin}
          id={id}
        >
          {children}
        </GGBase>
      </Provider>
    </div>
  )
}
