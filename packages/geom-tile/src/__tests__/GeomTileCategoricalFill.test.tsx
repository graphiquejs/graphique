/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import React from 'react'
import { defaultScheme } from '@graphique/graphique'
import { act, screen, within } from '@testing-library/react'
import {
  COLS,
  DEFAULT_AES,
  GGTile,
  NUM_COLS,
  NUM_ROWS,
  ROWS,
  setup,
  THEFT,
} from './shared'

beforeEach(() => {
  jest.clearAllTimers()
})

jest.useFakeTimers()

const runTheTimers = () => jest.runAllTimers()

const [EVEN, ODD] = ['even', 'odd']

describe('GeomTile: categorical fill', () => {
  it('renders 2D heatmap when given categorical fill mapping', async () => {
    const { user } = setup(
      <GGTile
        aes={{
          ...DEFAULT_AES,
          fill: (d) => (String(d.dow).startsWith('T') ? EVEN : ODD),
        }}
      />,
    )

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    let tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS)

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(NUM_ROWS)

    act(runTheTimers)

    xTickLabels.forEach((x, i) => expect(x).toHaveTextContent(COLS[i]))
    yTickLabels.forEach((y, i) => expect(y).toHaveTextContent(ROWS[i]))

    // has a categorical fill legend
    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    expect(await within(legend).findByText(THEFT)).toBeVisible()

    const legendItems = await within(legend).findAllByRole('button')

    act(runTheTimers)

    for (const [i, l] of legendItems.entries()) {
      await user.click(l)

      act(runTheTimers)

      tiles = await screen.findAllByTestId('__gg_geom_tile')

      if (i < 1) {
        expect(tiles.length).toBe(NUM_COLS * 2)
      } else {
        expect(tiles).toHaveLength(NUM_COLS * NUM_ROWS)
      }
    }

    expect(legendItems[0].querySelector('rect')).toHaveAttribute(
      'fill',
      defaultScheme[0],
    )
    expect(legendItems[1].querySelector('rect')).toHaveAttribute(
      'fill',
      defaultScheme[1],
    )
  })
})
