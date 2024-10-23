import React from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  GGTile,
  continuousXYTileData,
  NUM_COLS,
  NUM_ROWS,
  CONTINUOUS_X_TICKS,
  CONTINUOUS_Y_TICKS,
} from './shared'

jest.useFakeTimers()

describe('GeomTile: continuous x/y', () => {
  it('renders 2D heatmap when given numeric x/y mappings', async () => {
    render(<GGTile data={continuousXYTileData} />)

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS)

    act(() => jest.runAllTimers())

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(CONTINUOUS_X_TICKS.length)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(CONTINUOUS_Y_TICKS.length)

    xTickLabels.forEach((x, i) =>
      expect(x).toHaveTextContent(CONTINUOUS_X_TICKS[i]),
    )
    yTickLabels.forEach((y, i) =>
      expect(y).toHaveTextContent(CONTINUOUS_Y_TICKS[i]),
    )
  })
})
