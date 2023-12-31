import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { penguins } from '@graphique/datasets'
import {
  GGHLine,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  DEFAULT_AES,
  DEFAULT_STROKE_WIDTH,
  flipperLengthsBySpecies,
} from './shared'
import { GeomHLine } from '../geomHLine'

jest.useFakeTimers()

describe('horizontal line basics with GeomHLine', () => {
  it('renders line for each group with stroke aes mapping', async () => {
    render(
      <GGHLine
        aes={{
          ...DEFAULT_AES,
          y: d => d.count!
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // lines are formatted as expected
    const hLines = await screen.findAllByTestId('__gg_geom_hline')
    expect(hLines).toHaveLength(NUM_GROUPS)

    hLines.forEach((v, i) => {
      expect(v).toHaveAttribute('stroke', DEFAULT_GROUP_STROKES[i])
      expect(v).toHaveAttribute('stroke-width', DEFAULT_STROKE_WIDTH)
    })

    // no x axis/ticks because no x aes mapping to data
    const xTick = await screen.findByTestId('__gg_x_tick_label')
    expect(xTick.textContent).toBeFalsy()
  })

  it('renders line for each group with local aesthetics and data', async () => {
    render(
      <GGHLine data={penguins}>
        <GeomHLine
          data={flipperLengthsBySpecies}
          aes={{
            y: d => d.count!
          }}
        />
      </GGHLine>
    )

    act(() => jest.runAllTimers())

     // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // lines are formatted as expected
    const hLines = await screen.findAllByTestId('__gg_geom_hline')
    expect(hLines).toHaveLength(NUM_GROUPS)

    hLines.forEach((v, i) => {
      expect(v).toHaveAttribute('stroke', DEFAULT_GROUP_STROKES[i])
      expect(v).toHaveAttribute('stroke-width', DEFAULT_STROKE_WIDTH)
    })

    // has numeric x axis/ticks from x aes mapping to data
    const xTicks = await screen.findAllByTestId('__gg_x_tick_label')
    xTicks.forEach((tick) => {
      expect(Number(tick.textContent)).toBeGreaterThan(30)
    })
  })
})
