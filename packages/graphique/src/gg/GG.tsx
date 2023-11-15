import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
} from 'react'
import { Provider } from 'jotai'
import { generateID } from '../util'
import { GGBase } from './GGBase'
import type { RootGGProps } from './types/GG'

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
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      if (isContainerWidth)
        setGGWidth(rect.width)
    });
    if (ggRef.current && isContainerWidth)
      observer.observe(ggRef.current)

    return () => {
      if (ggRef.current && isContainerWidth)
        observer.unobserve(ggRef.current)
    }
  }, [isContainerWidth]);

  const id = useMemo(() => generateID(), [])

  return (
    <div ref={ggRef}>
      <Provider>
        <GGBase
          data={data.map((d: any, i) => ({
            ...d,
            gg_gen_index: i,
          }))}
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
