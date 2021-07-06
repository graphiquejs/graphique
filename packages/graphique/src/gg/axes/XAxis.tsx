import React, { useRef, useEffect, useState } from 'react'
import { axisBottom, AxisScale } from 'd3-axis'
import { select } from 'd3-selection'
import { useAtom } from 'jotai'
import { labelsState, themeState, xScaleState, tooltipState } from '../../atoms'
import { defaultGridOpacity } from './constants'
import { Aes } from '../types'
import { IScale } from '../../util/autoScale'

export interface XAxisProps {
  ggState: {
    id: string | undefined
    copiedData: unknown[]
    data: unknown[]
    aes: Aes
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
    copiedScales: IScale
    scales: IScale
  }
  animate?: boolean
}

export const XAxis = ({ ggState, animate = true }: XAxisProps) => {
  const [{ axis: axisTheme, axisX, grid: gridTheme, font }] =
    useAtom(themeState)
  const { aes, width, margin, height, scales } = ggState || {
    width: 0,
    height: 0,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }
  const scale = scales?.xScale as AxisScale<number | string | Date>
  const [{ datum }] = useAtom(tooltipState)
  const [labels] = useAtom(labelsState)
  const [{ format, numTicks, highlightOnFocus, className }] =
    useAtom(xScaleState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const axisRef = useRef<SVGGElement>(null)
  const gridRef = useRef<SVGGElement>(null)

  const thisAxis =
    width && format
      ? axisBottom(scale).tickFormat((v, i) =>
          format({ value: v, index: i, width })
        )
      : axisBottom(scale)

  const drawAxis: (selection: any) => void = thisAxis
    .tickSizeOuter(0)
    .ticks(width && typeof numTicks === 'function' ? numTicks(width) : numTicks)

  const drawGrid: (selection: any) => void = axisBottom(scale)
    .tickSize(-height + margin.top + margin.bottom)
    .tickSizeOuter(0)
    .tickFormat(() => '')
    .ticks(width && typeof numTicks === 'function' ? numTicks(width) : numTicks)

  useEffect(() => {
    const axis = select(axisRef.current)

    if (animate) {
      axis.transition().duration(1000).call(drawAxis)
    } else {
      axis.call(drawAxis)
    }

    const grid = select(gridRef.current)

    if (animate) {
      grid.transition().duration(1000).call(drawGrid)
    } else {
      grid.call(drawGrid)
    }

    // axis line
    axis
      .select('path')
      .attr(
        'stroke',
        axisTheme?.showAxisLines || axisX?.showAxisLine
          ? axisTheme?.stroke || axisX?.stroke || 'none'
          : 'none'
      )
      .attr('fill', 'none')

    // ticks
    axis
      .selectAll('line')
      .attr(
        'stroke',
        axisX?.tickStroke ||
          axisTheme?.tickStroke ||
          gridTheme?.stroke ||
          'currentColor'
      )
      .style(
        'opacity',
        axisX?.tickStroke || axisTheme?.tickStroke || gridTheme?.stroke
          ? 1
          : defaultGridOpacity
      )

    // tick labels
    axis
      .selectAll('text')
      .data(scale.bandwidth ? scale.domain() : [])
      .style('opacity', (d) => {
        if (scale.bandwidth && datum && highlightOnFocus) {
          return aes?.x(datum[0]) === d ? 1 : 0.4
        }
        if (axisX?.tickLabel?.color || axisTheme?.tickLabel?.color) {
          return 1
        }
        return 0.8
      })

    axis
      .selectAll('text')
      .attr(
        'fill',
        axisX?.tickLabel?.color || axisTheme?.tickLabel?.color || 'currentColor'
      )
      .style(
        'font-size',
        axisX?.tickLabel?.fontSize || axisTheme?.tickLabel?.fontSize || 12
      )
      .style(
        'font-family',
        axisX?.tickLabel?.fontFamily ||
          axisTheme?.tickLabel?.fontFamily ||
          font?.family ||
          'sans-serif'
      )

    if (className) {
      axis.attr('class', className)
    }

    // grid lines
    grid
      .selectAll('line')
      .attr(
        'stroke',
        gridTheme?.stroke === null
          ? 'transparent'
          : gridTheme?.stroke || 'currentColor'
      )
      .style('opacity', gridTheme?.stroke ? 1 : defaultGridOpacity)
    grid.select('path').attr('stroke', 'none')
  }, [
    axisTheme,
    axisX,
    gridTheme,
    drawAxis,
    drawGrid,
    font,
    animate,
    aes,
    datum,
    highlightOnFocus,
    scale,
    className,
  ])

  return !firstRender ? (
    <>
      <g ref={axisRef} transform={`translate(0, ${height - margin.bottom})`} />
      <g ref={gridRef} transform={`translate(0, ${height - margin.bottom})`} />
      {labels.x && (
        <g>
          <text
            style={{
              transform: `translate(${margin.left + 2}px, ${
                height - margin.bottom + 36
              }px)`,
              pointerEvents: 'none',
              fontFamily: font?.family,
              fontSize: 12,
              fill:
                axisTheme?.labelColor || axisX?.labelColor || 'currentColor',
              fontWeight: 600,
            }}
          >
            {labels.x}
          </text>
        </g>
      )}
    </>
  ) : null
}
