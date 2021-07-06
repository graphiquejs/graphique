import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from 'react'
import { Provider } from 'jotai'
import { generateID } from '../util/generateID'
import { GGBase } from './GGBase'
import { RootGGProps } from './types/GG'
import { debounce } from '../util/debounce'

export const GG = ({ children, ...props }: RootGGProps) => {
  const { data, aes, width, height, margin, useParentWidth } = { ...props }
  const ggRef = useRef<HTMLDivElement>(null)

  const [ggWidth, setGGWidth] = useState(
    useParentWidth ? ggRef.current?.clientWidth : width
  )

  useLayoutEffect(() => {
    if (useParentWidth) setGGWidth(ggRef.current?.clientWidth)
  }, [useParentWidth])

  useEffect(() => {
    const resize = debounce(80, () => setGGWidth(ggRef.current?.clientWidth))
    if (useParentWidth) {
      window.addEventListener('resize', resize)
    }
    return () => window.removeEventListener('resize', resize)
  }, [useParentWidth])

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
