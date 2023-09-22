import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { stocks } from '@graphique/datasets'
import { undefinedYValData } from './__data__/discontinuousData'
import { GeomLine } from '..'
import {
  GGLine,
  DEFAULT_AES,
  DEFAULT_SINGLE_STROKE,
  DEFAULT_GROUP_STROKES,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_DASHARRAYS,
  NUM_GROUPS,
} from './shared'

jest.useFakeTimers()

describe('line chart basics with GeomLine', () => {
  it('renders a single-lined line chart correctly', async () => {
    render(
      <GGLine
        data={stocks.filter(s => s.symbol === 'AAPL')}
        aes={{
          ...DEFAULT_AES,
          stroke: undefined,
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const line = await screen.findByTestId('__gg_geom_line')
    expect(line).toBeInTheDocument()

    // default attributes
    const stroke = line.getAttribute('stroke')
    expect(stroke).toBe(DEFAULT_SINGLE_STROKE)

    const strokeWidth = line.getAttribute('stroke-width')
    expect(strokeWidth).toBe(DEFAULT_STROKE_WIDTH)
  })

  it('rendered as expected', async () => {
    render(<GGLine />)

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // a line for each group created by stroke aesthetic
    const lines = await screen.findAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(NUM_GROUPS)

    // with default stroke colors
    const lineStrokes = lines.map(l => l.getAttribute('stroke'))
    const hasSameNumStrokes = lineStrokes.length === DEFAULT_GROUP_STROKES.length
    expect(
      hasSameNumStrokes &&
        lineStrokes.every((stroke, i) => stroke === DEFAULT_GROUP_STROKES[i])
    ).toBeTruthy()

    // with default stroke width
    const lineStrokeWidths = lines.map(l => l.getAttribute('stroke-width'))
    expect(lineStrokeWidths.every(strokeWidth => strokeWidth === DEFAULT_STROKE_WIDTH)).toBeTruthy()
  })

  it('has no lines when empty data', () => {
    render(<GGLine data={[]} />)

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const lines = screen.queryAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(0)
  })

  it('renders correctly with local aesthetics and data', async () => {
    render(
      <GGLine
        aes={{ x: DEFAULT_AES.x }}
      >
        <GeomLine
          aes={{
            y: DEFAULT_AES.y,
            stroke: DEFAULT_AES.stroke
          }}
        />
      </GGLine>
    )

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const lines = await screen.findAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(NUM_GROUPS)
  })

  it('has dashed lines with strokeDasharray aesthetic mapped to grouping variable', async () => {
    render(
      <GGLine
        aes={{
          x: DEFAULT_AES.x,
          y: DEFAULT_AES.y,
          strokeDasharray: DEFAULT_AES.stroke
        }}
      />
    )

    const lines = await screen.findAllByTestId('__gg_geom_line')
    const lineDasharrays = lines.map(l => l.getAttribute('stroke-dasharray'))
    const hasSameNumDasharrays = lineDasharrays.length === DEFAULT_DASHARRAYS.length

    expect(
      hasSameNumDasharrays &&
        lineDasharrays.every((dashArray, i) => dashArray === DEFAULT_DASHARRAYS[i])
    ).toBeTruthy()
  })

  it('renders lines correctly with the group aesthetic', async () => {
    render(
      <GGLine
        aes={{
          x: DEFAULT_AES.x,
          y: DEFAULT_AES.y,
          group: DEFAULT_AES.stroke
        }}
      />
    )

    // a line for each group
    const lines = await screen.findAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(NUM_GROUPS)

    // lines have the default stroke
    const lineStrokes = lines.map(l => l.getAttribute('stroke'))
    expect(lineStrokes.every(stroke => stroke === DEFAULT_SINGLE_STROKE)).toBeTruthy()
  })

  it('accepts other svg path attributes given directly to lines', async () => {
    const OPACITY = 0.3
    const DASHARRAY = '2,2'
    const STROKE = '#ff7200'

    render(
      <GGLine>
        <GeomLine
          opacity={OPACITY}
          stroke={STROKE}
          strokeDasharray={DASHARRAY}
        />
      </GGLine>
    )

    const lines = await screen.findAllByTestId('__gg_geom_line')
    expect(
      lines.every((l) => {
        const lineOpacity = Number(l.getAttribute('opacity'))
        const lineStroke = l.getAttribute('stroke')
        const lineDasharray = l.getAttribute('stroke-dasharray')

        return lineOpacity === OPACITY && lineStroke === STROKE && lineDasharray === DASHARRAY
      })
    ).toBeTruthy()
  })

  it('renders discontinuous paths when given missing y values', async () => {
    render(
      <GGLine data={undefinedYValData} />
    )

    const lines = await screen.findAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(NUM_GROUPS)
  })
})

