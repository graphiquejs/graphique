import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  CSSProperties,
  SVGAttributes,
  useRef,
} from 'react'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { useAtom } from 'jotai'
import {
  useGG,
  focusNodes,
  unfocusNodes,
  EventArea,
  themeState,
  zoomState,
  xScaleState,
  yScaleState,
  isDate,
  defineGroupAccessor,
  Aes,
  BrushAction,
  PageVisibility,
} from '@graphique/graphique'
import { type GeomAes } from './types'
import { Tooltip } from './tooltip'

export interface LabelProps extends SVGAttributes<SVGTextElement> {
  data?: unknown[]
  aes?: GeomAes
  label?: React.ReactNode | ((d: any) => React.ReactNode)
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  focusedKeys?: (string | number)[]
  showTooltip?: boolean
  brushAction?: BrushAction
  onDatumFocus?: (data: any, index: number[]) => void
  onDatumSelection?: (data: any, index: number[]) => void
  entrance?: 'data' | 'midpoint'
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
  isClipped?: boolean
}

const GeomLabel = ({
  data: localData,
  aes: localAes,
  label,
  focusedStyle,
  unfocusedStyle,
  focusedKeys = [],
  onDatumFocus,
  onDatumSelection,
  entrance = 'midpoint',
  onExit,
  showTooltip = false,
  brushAction,
  fillOpacity = 1,
  strokeOpacity = 1,
  isClipped = true,
  ...props
}: LabelProps) => {
  const { ggState } = useGG() || {}
  const { id, data, aes, scales, copiedScales, width, height, margin } = ggState || { width: 0 }

  const [theme, setTheme] = useAtom(themeState)
  const [{ xDomain: xZoomDomain, yDomain: yZoomDomain }] = useAtom(zoomState)
  const [{ isFixed: isFixedX }] = useAtom(xScaleState)
  const [{ isFixed: isFixedY }] = useAtom(yScaleState)

  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill, animationDuration: duration, font } = theme

  const initialGeomData = useMemo(() => localData || data, [data, localData])

  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes
  }, [aes, localAes])

  const group = useMemo(
    () => geomAes && defineGroupAccessor(geomAes as Aes),
    [geomAes, defineGroupAccessor]
  )

  const keyAccessor = useCallback(
    (d: unknown) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.x && geomAes.x(d)}-${geomAes?.y && geomAes.y(d)}-${
            group && group(d)
          }` as string),
    [geomAes, group]
  )

  const getLabel = useMemo(() => {
    if (!geomAes?.label && !label)
      throw new Error('You need to provide a `label` or map a `label` in `aes` in order to use GeomLabel')
      
    return geomAes?.label
  }, [geomAes, label])

  const undefinedX = useMemo(
    () =>
      initialGeomData
        ? initialGeomData.filter(
            (d) =>
              geomAes?.x &&
              (geomAes.x(d) === null ||
                typeof geomAes.x(d) === 'undefined' ||
                (isDate(geomAes.x(d)) && Number.isNaN(geomAes.x(d)?.valueOf())))
          )
        : [],
    [initialGeomData, geomAes]
  )
  const undefinedY = useMemo(
    () =>
      initialGeomData
        ? initialGeomData.filter(
            (d) =>
              geomAes?.y &&
              (geomAes.y(d) === null || typeof geomAes.y(d) === 'undefined')
          )
        : [],
    [initialGeomData]
  )

  const geomData = useMemo(() => {
    const presentData = initialGeomData?.filter(
      (d) =>
        geomAes?.x &&
        geomAes?.x(d) !== null &&
        !(typeof geomAes?.x(d) === 'undefined') &&
        (isDate(geomAes?.x(d))
          ? !Number.isNaN(geomAes?.x(d)?.valueOf())
          : true) &&
        geomAes.y &&
        geomAes.y(d) !== null &&
        !(typeof geomAes.y(d) === 'undefined')
    )

    const uniqueKeyVals = Array.from(
      new Set(presentData?.map((d) => keyAccessor(d)))
    )

    return uniqueKeyVals.flatMap((k) => {
      const dataWithKey = presentData?.filter((d) => keyAccessor(d) === k)
      if (dataWithKey && dataWithKey.length > 1) {
        return dataWithKey.map((dk: any, i) => ({
          ...dk,
          gg_gen_index: i,
        }))
      }
      return dataWithKey?.flat()
    })
  }, [initialGeomData, keyAccessor])

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (firstRender && undefinedX.length > 0) {
      console.warn(
        `Ignoring ${undefinedX.length} labels with missing x values.`
      )
    }

    if (firstRender && undefinedY.length > 0) {
      console.warn(
        `Ignoring ${undefinedY.length} labels with missing y values.`
      )
    }
  }, [firstRender, undefinedX, undefinedY])

  const bottomPos = useMemo(
    () => (height && margin ? height - margin.bottom : undefined),
    [height, margin]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        label: {
          fillOpacity: props.style?.fillOpacity || fillOpacity,
          stroke: strokeColor,
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
        },
      },
    }))
  }, [
    fillOpacity,
    setTheme,
    strokeColor,
    strokeOpacity,
    strokeWidth,
    props.style,
  ])

  const baseStyles = {
    transition: 'fill-opacity 200ms',
    fillOpacity,
    strokeOpacity,
    ...props.style,
  }

  const focusedStyles = {
    ...baseStyles,
    fillOpacity,
    strokeOpacity,
    ...focusedStyle,
  }

  const unfocusedStyles = {
    ...baseStyles,
    fillOpacity: 0.2,
    strokeOpacity: 0.2,
    ...unfocusedStyle,
  }

  const fill = useMemo(
    () => (d: unknown) =>
      fillColor ||
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            geomAes.fill(d)
            // aes.fill(d) === null ? "[null]" : (aes.fill(d) as any)
          ) as string | undefined)
        : defaultFill),
    [geomAes, copiedScales, fillColor, defaultFill]
  )

  const getStroke = useMemo(
    () => (d: unknown) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : '#fff'),
    [geomAes, copiedScales, strokeColor]
  )

  // if (scales?.yScale?.bandwidth) {
  //   scales.yScale.padding(1)
  // }
  // if (scales?.xScale?.bandwidth) {
  //   scales.xScale?.padding(1)
  // }

  const x = useMemo(() => {
    if (scales?.xScale.bandwidth) {
      return (d: unknown) =>
        (scales?.xScale(geomAes?.x && geomAes.x(d)) || 0) +
        scales?.xScale.bandwidth() / 2 +
        0.9
    }
    return (d: unknown) =>
      scales?.xScale && geomAes?.x && (scales.xScale(geomAes.x(d)) || 0)
  }, [scales, geomAes])

  const y = useMemo(() => {
    if (scales?.yScale.bandwidth) {
      return (d: unknown) =>
        (scales?.yScale(geomAes?.y && geomAes.y(d)) || 0) +
        scales?.yScale.bandwidth() / 2
    }
    return (d: unknown) =>
      scales?.yScale && geomAes?.y && (scales.yScale(geomAes.y(d)) || 0)
  }, [scales, geomAes])

  const groupRef = useRef<SVGGElement>(null)
  const texts = groupRef.current?.getElementsByTagName('text')

  const [shouldClip, setShouldClip] = useState(
    isClipped || isFixedX || isFixedY
  )
  useEffect(() => {
    if (xZoomDomain?.current || yZoomDomain?.current) {
      setShouldClip(true)
    } else {
      const timeout = setTimeout(() => setShouldClip(isClipped), duration)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isFixedX, isFixedY, xZoomDomain?.current, yZoomDomain?.current, duration])

  return (
    <>
      <g
        ref={groupRef}
        clipPath={shouldClip ? `url(#__gg_canvas_${id})` : undefined}
      >
        <PageVisibility>
          {(isVisible) =>
            !firstRender &&
            isVisible && (
              <NodeGroup
                data={[...(geomData as any[])]}
                keyAccessor={(d) =>
                  geomAes?.key
                    ? keyAccessor(d)
                    : `${keyAccessor(d)}-${d.gg_gen_index}`
                }
                start={(d) => ({
                  x: x(d),
                  y: entrance === 'data' ? y(d) : bottomPos,
                  fill: fill(d),
                  stroke: getStroke(d),
                  // fillOpacity: 0,
                  // strokeOpacity: 0,
                })}
                enter={(d) => ({
                  x: [x(d)],
                  y: [y(d)],
                  fill: fill(d),
                  stroke: getStroke(d),
                  // fillOpacity: [fillOpacity],
                  // strokeOpacity: [strokeOpacity],
                  timing: { duration, ease: easeCubic },
                })}
                update={(d) => ({
                  x: [x(d)],
                  y: [y(d)],
                  fill: fill(d),
                  stroke: getStroke(d),
                  // fillOpacity: firstRender ? fillOpacity : [fillOpacity],
                  // strokeOpacity: firstRender ? strokeOpacity : [strokeOpacity],
                  timing: { duration, ease: easeCubic },
                })}
                leave={() => ({
                  fill: 'transparent',
                  stroke: 'transparent',
                  // strokeOpacity: 0,
                  // y: [bottomPos],
                  timing: { duration, ease: easeCubic },
                })}
                interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
              >
                {(nodes) => (
                  <>
                    {nodes.map(({ state, key, data: nodeData }) => {
                      let styles = {}
                      if (focusedKeys.includes(key))
                        styles = focusedStyles
                      if (focusedKeys?.length > 0 && !focusedKeys.includes(key))
                        styles = unfocusedStyles
                      
                      const nodeX = x(nodeData) ?? 0
                      
                      return (
                        <text
                          key={key}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...props}
                          fillOpacity={state.fillOpacity}
                          strokeOpacity={state.strokeOpacity}
                          stroke={state.stroke}
                          fill={state.fill}
                          strokeWidth={strokeWidth ?? 3}
                          paintOrder="stroke"
                          pointerEvents="none"
                          textAnchor={props.textAnchor ?? (
                            nodeX > (width / 2) ? 'end' : undefined
                          )}
                          dx={props.dx ?? (
                            nodeX > width / 2 ? -7 : 7
                          )}
                          dy={props.dy ?? 3.8}
                          x={state.x}
                          y={state.y}
                          style={{
                            fontFamily: (props.style?.fontFamily)
                              ?? props.fontFamily
                              ?? (font?.family)
                              ?? "-apple-system, sans-serif",
                            fontSize: 11,
                            fontWeight: 600,
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            // stroke: strokeColor ?? '#fff',
                            ...styles,
                          }}
                          data-testid="__gg_geom_label"
                        >
                          {label ?? (getLabel && getLabel(nodeData))}
                        </text>
                      )
                    })}
                  </>
                )}
              </NodeGroup>
            )
          }
        </PageVisibility>
      </g>
      {(showTooltip || brushAction) && geomAes && (
        <>
          <EventArea
            data={geomData}
            showTooltip={showTooltip}
            brushAction={brushAction}
            aes={geomAes}
            x={x}
            y={y}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: unknown; i: number[] }) => {
              const focusedIndexes = geomData.flatMap((gd, fi) => (
                focusedKeys.includes(keyAccessor(gd)) ? fi : []
              ))

              if (texts) {
                focusNodes({
                  nodes: texts,
                  focusedIndex: [...focusedIndexes, ...[i].flat()],
                  focusedStyles,
                  unfocusedStyles,
                })
              }
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: any; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onMouseLeave={() => {
              if (texts) {
                if (showTooltip) {
                  unfocusNodes({ nodes: texts, baseStyles })
                  if (focusedKeys) {
                    focusNodes({
                      nodes: texts,
                      focusedIndex: geomData.flatMap((d, i) => (
                        focusedKeys.includes(keyAccessor(d)) ? i : []
                      )),
                      focusedStyles,
                      unfocusedStyles,
                    })
                  }
                }
              }

              if (onExit) onExit()
            }}
          />
          {showTooltip && <Tooltip aes={geomAes} group={group} />}
        </>
      )}
    </>
  )
}

GeomLabel.displayName = 'GeomLabel'
export { GeomLabel }
