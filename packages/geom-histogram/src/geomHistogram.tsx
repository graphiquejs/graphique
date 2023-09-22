import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  useGG,
  PageVisibility,
  tooltipState,
  themeState,
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
  isRelative?: boolean
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
  isRelative = false,
  rangeFormat,
  ...props
}: HistogramProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales } = ggState || {}

  const [, setYScale] = useAtom(yScaleState)
  const [{ reverse: reversedX }, setXScale] = useAtom(xScaleState)
  const [{ xDomain: xZoomDomain }] = useAtom(zoomState)
  const [, setTooltip] = useAtom(tooltipState)
  const [, setTheme] = useAtom(themeState)

  const group = useMemo(() => scales?.groupAccessor, [scales])
  const groups = useMemo(() => scales?.groups || ['__group'], [scales])

  const rangeFormatter = useCallback(
    (x0: number, x1: number) => {
      const [x0String, x1String] = [x0.toLocaleString(), x1.toLocaleString()]

      if (rangeFormat)
        return rangeFormat(x0, x1)
      if (reversedX)
        return `${x1String} \u2013 ${x0String}`
      return `${x0String} \u2013 ${x1String}`
    },
    [reversedX, rangeFormat]
  )

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

  const originalBinData = useMemo(() => {
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
  }, [])

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

  const total = originalBinData.reduce((a, b) => a + b.n, 0)

  scales?.yScale.domain([0, max(reconciledBinData, (d) => isRelative ? d.n / total : d.n)])

  const formatRange = useCallback(
    (x0: unknown) => {
      const xBin = binData.find((b) => b.x0 === x0)
      const x1 = xBin?.x1 as number
      return rangeFormatter(x0 as number, x1)
    },
    [binData, rangeFormatter]
  )

  const binWidth = useMemo(() => (
    reconciledBinData?.[0]?.x0 && reconciledBinData?.[0]?.x1 ? reconciledBinData[0].x1 - reconciledBinData[0].x0 : undefined
  ), [])

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        histogram: {
          binWidth,
        },
      },
    }))
  }, [
    binWidth
  ])

  useEffect(() => {
    setXScale((prev) => ({
      ...prev,
      domain: [min(binData, (d) => d.x0), (max(binData, (d) => d.x1) ?? 0)] as [
        number,
        number
      ],
    }))
    setYScale((prev) => ({
      ...prev,
      domain: [
        0,
        max(binData, (d) => isRelative ? d.n / total : d.n) as number
      ],
    }))
  }, [data, setXScale, setYScale, bins, isRelative])

  useEffect(() => {
    setTooltip(prev => ({
      ...prev,
      xFormat: formatRange,
    }))
  }, [formatRange])

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
                y: (d: HistogramBin) => isRelative ? d.n / total : d.n,
                fill: aes?.fill ? (d: HistogramBin) => d.group : undefined,
                stroke: aes?.stroke ? (d: HistogramBin) => d.group : undefined,
                key: (d: any) => `${d.group}-${d.n}-${d.x0}`,
              }}
              xPadding={xPadding}
              align={reversedX ? 'right' : align}
              position="identity"
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
            />
          </>
        )}
      </PageVisibility>
    </>
  ) : null
}

GeomHistogram.displayName = 'GeomHistogram'
export { GeomHistogram }
