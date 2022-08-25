import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useGG,
  Tooltip,
  PageVisibility,
  xScaleState,
  yScaleState,
  zoomState,
} from '@graphique/graphique'
import { GeomCol, GeomColProps } from '@graphique/geom-col'
import { bin, min, max } from 'd3-array'
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
  const [{ xDomain: xZoomDomain }, setZoom] = useAtom(zoomState)

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
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const binData = useMemo(() => {
    const overallBins: HistogramBin[][] = []

    const binned = createBins()(data as unknown as ArrayLike<number>)

    groups.forEach((g) => {
      const thisBinData: HistogramBin[] = binned.map((thisBin) => ({
        n: thisBin.filter((b) => (group ? group(b) === g : true)).length,
        group: g,
        x0: thisBin.x0,
        x1: thisBin.x1,
      }))

      overallBins.push(thisBinData)
    })
    return ([] as HistogramBin[]).concat(...overallBins)
  }, [data, createBins, groups, group])

  const reconciledBinData = useMemo(() => {
    let thisBinData = binData
    if (xZoomDomain?.current) {
      thisBinData = binData.filter((d) => {
        const xVal = d.x0
        return xZoomDomain?.current
          ? typeof xVal !== 'undefined' &&
              xVal <= xZoomDomain.current[1] &&
              xVal >= xZoomDomain.current[0]
          : d
      })
    }
    return thisBinData
  }, [binData, xZoomDomain?.current])

  scales?.yScale.domain([0, max(reconciledBinData, (d) => d.n)])

  const formatRange = useCallback(
    (x0: unknown) => {
      const xBin = binData.find((b) => b.x0 === x0)
      const x1 = xBin?.x1 as number
      return rangeFormat(x0 as number, x1)
    },
    [binData, rangeFormat]
  )

  useEffect(() => {
    setXScale((prev) => ({
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
    setZoom((prev) => ({
      ...prev,
      xDomain: {
        ...prev.xDomain,
        original: [min(binData, (d) => d.x0), max(binData, (d) => d.x0)],
      },
    }))
  }, [data, setXScale, setYScale, bins])

  return !firstRender ? (
    <>
      <PageVisibility>
        {(isVisible) => isVisible && (
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
        )}
      </PageVisibility>
    </>
  ) : null
}

GeomHistogram.displayName = 'GeomHistogram'
export { GeomHistogram }
