import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useGG,
  Tooltip,
  xScaleState,
  yScaleState,
  XYScaleProps,
} from '@graphique/graphique'
import { GeomCol, GeomColProps } from '@graphique/geom-col'
import { bin, max, min } from 'd3-array'
import { useAtom } from 'jotai'

export interface HistogramProps extends GeomColProps {
  bins?: number
  rangeFormat?: (x0: number, x1: number) => string
}

export type HistogramBin = {
  n: number
  group: string
  x0?: number
  x1?: number
}

const GeomHistogram = ({
  xPadding = 0,
  align = 'left',
  bins = 30,
  rangeFormat = (x0, x1) => `${x0.toLocaleString()} – ${x1.toLocaleString()}`,
  ...props
}: HistogramProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales } = ggState || {}

  const [, setYScale] = useAtom(yScaleState)
  const [, setXScale] = useAtom(xScaleState)

  const group = useMemo(() => scales?.groupAccessor, [scales])
  const groups = useMemo(() => scales?.groups || ['__group'], [scales])

  const createBins = useCallback(
    () =>
      bin()
        .value((d) => (aes?.x ? aes?.x(d) : d) as number)
        .thresholds(bins),
    [bins, aes]
  )

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const binData = useMemo(() => {
    const overallBins: HistogramBin[][] = []

    const binned = createBins()(data as unknown as ArrayLike<number>)

    groups.forEach((g) => {
      const thisBinData: HistogramBin[] = binned.map((thisBin) => ({
        n: thisBin.filter((b) => group && group(b) === g).length,
        group: g,
        x0: thisBin.x0,
        x1: thisBin.x1,
      }))

      overallBins.push(thisBinData)
    })
    return ([] as HistogramBin[]).concat(...overallBins)
  }, [data, createBins, groups, group])

  scales?.yScale.domain([0, max(binData, (d) => d.n)])

  useEffect(() => {
    setXScale((prev: XYScaleProps) => ({
      ...prev,
      domain: [min(binData, (d) => d.x0), max(binData, (d) => d.x0)] as [
        number,
        number
      ],
    }))
    setYScale((prev) => ({
      ...prev,
      domain: [0, max(binData, (d) => d.n) as number],
    }))
  }, [data, setXScale, setYScale, bins])

  const formatRange = useCallback(
    (x0: unknown) => {
      const xBin = binData.find((b) => b.x0 === x0)
      const x1 = xBin?.x1 as number
      return rangeFormat(x0 as number, x1)
    },
    [binData, rangeFormat]
  )

  return !firstRender ? (
    <>
      <GeomCol
        data={binData}
        aes={{
          ...aes,
          x: (d: HistogramBin) => d.x0 as number,
          y: (d: HistogramBin) => d.n,
          fill: aes?.fill ? (d: HistogramBin) => d.group : undefined,
          stroke: aes?.stroke ? (d: HistogramBin) => d.group : undefined,
          key: (d: any) => `${d.group}-${d.n}-${d.x0}`,
        }}
        xPadding={xPadding}
        align={align}
        position="identity"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      <Tooltip xFormat={formatRange} />
    </>
  ) : null
}

GeomHistogram.displayName = 'GeomHistogram'
export { GeomHistogram }
