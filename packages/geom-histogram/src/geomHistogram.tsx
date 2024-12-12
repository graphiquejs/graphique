import React, {
  CSSProperties,
  SVGAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useGG,
  usePageVisibility,
  tooltipState,
  themeState,
  xScaleState,
  yScaleState,
  zoomState,
  BrushAction,
} from '@graphique/graphique'
import {
  GeomCol,
  type HistogramBin,
  Alignment,
  Position,
} from '@graphique/geom-col'
import { bin, min, max } from 'd3-array'
import { useAtom } from 'jotai'

export interface GeomProps {
  /** approximate number of equal-width bins that the x domain is divided into (_default_: `30`) */
  bins?: number
  /** function for customizing bin range format in tooltips */
  rangeFormat?: (x0: number, x1: number) => string
  /** should y values for bins be displayed as relative frequencies instead of counts (_default_: `false`) */
  isRelative?: boolean
  /** attributes passed to the underlying SVG elements */
  attr?: SVGAttributes<SVGRectElement>
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** determines what happens when brushing (clicking and dragging) over the drawing area  */
  brushAction?: BrushAction
  /** styles applied to focused elements */
  focusedStyle?: CSSProperties
  /** styles applied to unfocused elements */
  unfocusedStyle?: CSSProperties
  /** callback called for mousemove events on the drawing area when focusing data */
  onDatumFocus?: (data: HistogramBin[], index: number[]) => void
  /** callback called for click events on the drawing area when selecting focused data */
  onDatumSelection?: (data: HistogramBin[], index: number[]) => void
  /** callback called for mouseleave events on the drawing area */
  onExit?: () => void
}

const GeomHistogram = <Datum,>({
  bins = 30,
  isRelative = false,
  rangeFormat,
  showTooltip = true,
  ...props // pass these on to GeomCol
}: GeomProps) => {
  const { ggState } = useGG<Datum>() || {}
  const { data, aes, scales } = ggState || {}

  const [, setYScale] = useAtom(yScaleState)
  const [{ reverse: reversedX }, setXScale] = useAtom(xScaleState)
  const [{ xDomain: xZoomDomain }] = useAtom(zoomState)
  const [, setTooltip] = useAtom(tooltipState)
  const [, setTheme] = useAtom(themeState)

  const isVisible = usePageVisibility()

  const group = useMemo(() => scales?.groupAccessor, [scales])
  const groups = useMemo(() => scales?.groups || ['__group'], [scales])

  const rangeFormatter = useCallback(
    (x0: number, x1: number) => {
      if (rangeFormat) return rangeFormat(x0, x1)

      const [x0String, x1String] = [x0?.toLocaleString(), x1?.toLocaleString()]

      if (reversedX) return `${x1String} \u2013 ${x0String}`
      return `${x0String} \u2013 ${x1String}`
    },
    [reversedX, rangeFormat],
  )

  const createBins = useCallback(
    () =>
      bin<Datum, number>()
        .value((d) => (aes?.x ? aes?.x(d) : d) as number)
        .thresholds(bins),
    [bins, aes],
  )

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const binData = useMemo(() => {
    const overallBins: HistogramBin[][] = []

    const binned = createBins()(data)

    groups.forEach((g) => {
      const thisBinData: HistogramBin[] = binned.map((thisBin) => ({
        group: g,
        n: thisBin.filter((b) => (group ? group(b) === g : true)).length,
        x0: thisBin.x0,
        x1: thisBin.x1,
      }))

      overallBins.push(thisBinData)
    })
    return ([] as HistogramBin[]).concat(...overallBins)
  }, [data, createBins, groups, group])

  const originalBinData = useMemo(() => {
    const overallBins: HistogramBin[][] = []

    const binned = createBins()(data)

    groups.forEach((g) => {
      const thisBinData: HistogramBin[] = binned.map((thisBin) => ({
        group: g,
        n: thisBin.filter((b) => (group ? group(b) === g : true)).length,
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

  scales?.yScale.domain([
    0,
    max(reconciledBinData, (d) => (isRelative ? d.n / total : d.n)),
  ])

  const formatRange = useCallback(
    (x0: unknown) => {
      const xBin = binData.find((b) => b.x0 === x0)
      const x1 = xBin?.x1 as number
      return rangeFormatter(x0 as number, x1)
    },
    [binData, rangeFormatter],
  )

  const binWidth = useMemo(
    () =>
      reconciledBinData?.[0]?.x0 && reconciledBinData?.[0]?.x1
        ? reconciledBinData[0].x1 - reconciledBinData[0].x0
        : undefined,
    [],
  )

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
  }, [binWidth])

  useEffect(() => {
    setXScale((prev) => ({
      ...prev,
      domain: [min(binData, (d) => d.x0), max(binData, (d) => d.x1) ?? 0] as [
        number,
        number,
      ],
    }))
    setYScale((prev) => ({
      ...prev,
      domain: [
        0,
        max(binData, (d) => (isRelative ? d.n / total : d.n)) as number,
      ],
    }))
  }, [JSON.stringify(binData), setXScale, setYScale, bins, isRelative])

  useEffect(() => {
    if (showTooltip) {
      setTooltip((prev) => ({
        ...prev,
        xFormat: formatRange,
      }))
    }
  }, [formatRange, showTooltip])

  return !firstRender ? (
    <>
      {isVisible && (
        <>
          <GeomCol<any>
            data={binData}
            aes={{
              ...aes,
              x: (d: HistogramBin) => d.x0 as number,
              y: (d: HistogramBin) => (isRelative ? d.n / total : d.n),
              fill: aes?.fill ? (d: HistogramBin) => d.group : undefined,
              stroke: aes?.stroke ? (d: HistogramBin) => d.group : undefined,
              key: (d: HistogramBin) => `${d.group}-${d.n}-${d.x0}`,
            }}
            xPadding={0}
            align={reversedX ? Alignment.RIGHT : Alignment.LEFT}
            position={Position.IDENTITY}
            showTooltip={showTooltip}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        </>
      )}
    </>
  ) : null
}

GeomHistogram.displayName = 'GeomHistogram'
export { GeomHistogram }
