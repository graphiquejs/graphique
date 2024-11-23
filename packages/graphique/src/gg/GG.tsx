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

/**
 * **The top-level component and starting point for creating Graphique visualizations**.
 *
 * Pass in data, map data properties to visual properties (`aes`), and fill with child Geoms
 * to start visualizing data. Configure and customize with a friendly, component-based API.
 *
 * @param data - the data used to create the base, an array of objects
 * @param aes - an object of accessor methods to map data characteristics to visual characteristics
 * @param width - the width of the visualization area in pixels
 * @param height - the height of the visualization area in pixels
 * @param margin - an object specifying the margins surrounding the visualization area
 * @param isContainerWidth - when true, the visualization will fill its parent container's width
 * @param children - elements used to specify and configure the visualization (e.g. Geoms, Scales, Labels, Theme, etc.)
 *
 * @returns {React.JSX.Element} A React element that renders your visualization!
 */
export const GG = <Datum,>({ children, ...props }: RootGGProps<Datum>) => {
  const { data, aes, width, height, margin, isContainerWidth } = { ...props }
  const ggRef = useRef<HTMLDivElement>(null)

  const [ggWidth, setGGWidth] = useState(
    isContainerWidth ? ggRef.current?.clientWidth : width,
  )

  useLayoutEffect(() => {
    if (isContainerWidth) setGGWidth(ggRef.current?.clientWidth)
  }, [isContainerWidth])

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      if (isContainerWidth) setGGWidth(rect.width)
    })
    if (ggRef.current && isContainerWidth) observer.observe(ggRef.current)

    return () => {
      if (ggRef.current && isContainerWidth) observer.unobserve(ggRef.current)
    }
  }, [isContainerWidth])

  const id = useMemo(() => generateID(), [])

  return (
    <div ref={ggRef}>
      <Provider>
        <GGBase
          data={data.map((d: Datum, i) => ({
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
