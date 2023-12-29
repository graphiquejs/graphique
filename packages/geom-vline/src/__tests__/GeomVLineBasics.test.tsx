import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { penguins } from '@graphique/datasets'
import {
  GGVLine,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  DEFAULT_AES,
  DEFAULT_STROKE_WIDTH,
} from './shared'
import { beakLengthsBySpecies } from './__data__/penguinSummaries'
import { GeomVLine } from '../geomVLine'
import { aaplMarketcap } from './__data__/aaplMarketcap'

jest.useFakeTimers()

describe('vertical line basics with GeomVLine', () => {
  it('renders line for each group with stroke aes mapping', async () => {
    render(
      <GGVLine
        aes={{
          ...DEFAULT_AES,
          x: d => d.count!
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // lines are formatted as expected
    const vLines = await screen.findAllByTestId('__gg_geom_vline')
    expect(vLines).toHaveLength(NUM_GROUPS)

    vLines.forEach((v, i) => {
      expect(v).toHaveAttribute('stroke', DEFAULT_GROUP_STROKES[i])
      expect(v).toHaveAttribute('stroke-width', DEFAULT_STROKE_WIDTH)
    })

    // no y axis/ticks because no y aes mapping to data
    const yTick = await screen.findByTestId('__gg_y_tick_label')
    expect(yTick.textContent).toBeFalsy()
  })

  it('renders lines for every x mapping', async () => {
    render(
      <GGVLine
        data={aaplMarketcap}
        aes={{
          x: d => new Date(d.date),
          y: d => d.marketCap,
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // renders vlines for every x aes mapping
    const vLines = await screen.findAllByTestId('__gg_geom_vline')
    expect(vLines).toHaveLength(aaplMarketcap.length)
  })

  it('renders single vertical line along x scale when it should', async () => {
    render(
      <GGVLine
        data={aaplMarketcap}
        aes={{
          x: d => new Date(d.date),
          y: d => d.marketCap,
        }}
      >
        <GeomVLine data={[aaplMarketcap[45]]} />
      </GGVLine>
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // renders single vline
    const vLines = await screen.findAllByTestId('__gg_geom_vline')
    expect(vLines).toHaveLength(1)
  })

  it('renders line for each group with local aesthetics and data', async () => {
    render(
      <GGVLine data={penguins}>
        <GeomVLine
          data={beakLengthsBySpecies}
          aes={{
            x: d => d.count!
          }}
        />
      </GGVLine>
    )

    act(() => jest.runAllTimers())

     // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // lines are formatted as expected
    const vLines = await screen.findAllByTestId('__gg_geom_vline')
    expect(vLines).toHaveLength(NUM_GROUPS)

    vLines.forEach((v, i) => {
      expect(v).toHaveAttribute('stroke', DEFAULT_GROUP_STROKES[i])
      expect(v).toHaveAttribute('stroke-width', DEFAULT_STROKE_WIDTH)
    })

    // has numeric y axis/ticks from y aes mapping to data
    const yTicks = await screen.findAllByTestId('__gg_y_tick_label')
    yTicks.forEach((tick) => {
      expect(Number(tick.textContent)).toBeGreaterThan(100)
    })
  })
})
