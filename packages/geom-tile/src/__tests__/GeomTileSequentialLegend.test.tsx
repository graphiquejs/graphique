import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { GG, ScaleFill, createSequentialScheme } from '@graphique/graphique'
import { scaleQuantile, scaleQuantize } from 'd3-scale'
import { schemeBlues } from 'd3-scale-chromatic'
import { extent } from 'd3-array'
import { GeomTile, Legend } from '..'
import { OPACITY } from '../legend/constants'
import { setup, testTileData } from './shared'

const defaultNumericFormat = (v: number) => v.toLocaleString()

const DEFAULT_SEQUENTIAL_COLORS = createSequentialScheme()
const CUSTOM_SCHEME = schemeBlues[7]

const counts = testTileData.map((d) => d.count)

const EXPECTED_QUANTILE_TICKS = scaleQuantile(
  counts,
  DEFAULT_SEQUENTIAL_COLORS,
).quantiles()

const EXPECTED_QUANTIZE_TICKS = scaleQuantize(
  extent(counts) as [number, number],
  DEFAULT_SEQUENTIAL_COLORS,
).thresholds()

const SINGLE_THRESHOLD: [number, number] = [
  EXPECTED_QUANTILE_TICKS[0],
  EXPECTED_QUANTILE_TICKS[1],
]

const EXPECTED_QUANTILE_TICKS_CUSTOM = scaleQuantile(
  counts,
  CUSTOM_SCHEME,
).quantiles()

jest.useFakeTimers()

const mockSelection = jest.fn()

const TestComponent = ({
  scale,
  focusedThresholds,
  onSelection,
}: {
  scale?: React.ReactNode
  focusedThresholds?: [number, number][]
  onSelection?: () => void
}) => (
  <GG
    data={testTileData}
    aes={{
      x: () => null,
      fill: (d) => d.count,
    }}
    height={0}
  >
    <GeomTile />
    {scale}
    <Legend focusedThresholds={focusedThresholds} onSelection={onSelection} />
  </GG>
)

describe('GeomTile: discrete, sequential legend', () => {
  it('renders default sequential legend with quantile fill scale', async () => {
    // shows up
    render(<TestComponent scale={<ScaleFill type={scaleQuantile} />} />)

    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    act(() => jest.runAllTimers())

    // has correct color values + tick labels
    const tickLabels = await screen.findAllByTestId('__gg_legend_tick_label')
    expect(tickLabels).toHaveLength(EXPECTED_QUANTILE_TICKS.length)

    tickLabels.forEach((t, i) => {
      expect(t.textContent).toBe(
        defaultNumericFormat(EXPECTED_QUANTILE_TICKS[i]),
      )
      expect(t).toHaveStyle({
        opacity: OPACITY.tickLabel.focused,
      })
      expect(t).toBeVisible()
    })

    const colorRects = await screen.findAllByTestId('__gg_legend_color_rect')
    expect(colorRects).toHaveLength(EXPECTED_QUANTILE_TICKS.length + 1)

    colorRects.forEach((r, i) => {
      expect(r).toHaveAttribute('fill', DEFAULT_SEQUENTIAL_COLORS[i])
      expect(r).toHaveStyle({ cursor: 'default' })
      expect(r).toBeVisible()
    })
  })

  it('accepts focusedThresholds to focus discrete group(s) and label(s)', async () => {
    // shows up
    render(
      <TestComponent
        scale={<ScaleFill type={scaleQuantile} />}
        focusedThresholds={[SINGLE_THRESHOLD]}
      />,
    )

    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    act(() => jest.runAllTimers())

    // has correct formatting for color values + tick labels
    const tickLabels = await screen.findAllByTestId('__gg_legend_tick_label')
    expect(tickLabels).toHaveLength(EXPECTED_QUANTILE_TICKS.length)

    tickLabels.forEach((t, i) => {
      const isFocused = [0, 1].includes(i)

      expect(t).toHaveStyle({
        opacity: isFocused
          ? OPACITY.tickLabel.focused
          : OPACITY.tickLabel.unfocused,
      })
      expect(t).toBeVisible()
    })

    const colorRects = await screen.findAllByTestId('__gg_legend_color_rect')
    expect(colorRects).toHaveLength(EXPECTED_QUANTILE_TICKS.length + 1)

    colorRects.forEach((r, i) => {
      const isFocused = i === 1

      expect(r).toHaveStyle({
        opacity: isFocused ? OPACITY.opaque : OPACITY.colorRect.unfocused,
      })
      expect(r).toBeVisible()
    })
  })

  it('renders default sequential legend with quantize fill scale', async () => {
    render(<TestComponent scale={<ScaleFill type={scaleQuantize} />} />)

    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    act(() => jest.runAllTimers())

    // has correct color values + tick labels
    const tickLabels = await screen.findAllByTestId('__gg_legend_tick_label')
    expect(tickLabels).toHaveLength(EXPECTED_QUANTIZE_TICKS.length)

    tickLabels.forEach((t, i) => {
      expect(t.textContent).toBe(
        defaultNumericFormat(EXPECTED_QUANTIZE_TICKS[i]),
      )
      expect(t).toBeVisible()
    })

    const colorRects = await screen.findAllByTestId('__gg_legend_color_rect')
    expect(colorRects).toHaveLength(EXPECTED_QUANTIZE_TICKS.length + 1)

    colorRects.forEach((r, i) => {
      expect(r).toHaveAttribute('fill', DEFAULT_SEQUENTIAL_COLORS[i])
      expect(r).toBeVisible()
    })
  })

  it('accepts onSelection callbacks', async () => {
    const { user } = setup(
      <TestComponent
        scale={<ScaleFill type={scaleQuantile} />}
        onSelection={mockSelection}
      />,
    )

    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    const colorRects = await screen.findAllByTestId('__gg_legend_color_rect')

    jest.runAllTimers()

    await user.click(colorRects[1])
    expect(mockSelection).toHaveBeenCalledWith(
      SINGLE_THRESHOLD,
      expect.objectContaining({
        type: 'click',
        target: expect.any(SVGElement),
      }),
    )
  })

  it('can accept custom fill themes', async () => {
    // shows up
    render(
      <TestComponent
        scale={<ScaleFill type={scaleQuantile} values={CUSTOM_SCHEME} />}
      />,
    )

    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    act(() => jest.runAllTimers())

    // number / values for colors + tick labels
    // has correct color values + tick labels
    const tickLabels = await screen.findAllByTestId('__gg_legend_tick_label')
    expect(tickLabels).toHaveLength(EXPECTED_QUANTILE_TICKS_CUSTOM.length)

    tickLabels.forEach((t, i) => {
      expect(t.textContent).toBe(
        defaultNumericFormat(EXPECTED_QUANTILE_TICKS_CUSTOM[i]),
      )
      expect(t).toBeVisible()
    })

    const colorRects = await screen.findAllByTestId('__gg_legend_color_rect')
    expect(colorRects).toHaveLength(EXPECTED_QUANTILE_TICKS_CUSTOM.length + 1)

    colorRects.forEach((r, i) => {
      expect(r).toHaveAttribute('fill', CUSTOM_SCHEME[i])
      expect(r).toBeVisible()
    })
  })
})
