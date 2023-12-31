import React from 'react'
import { penguins } from '@graphique/datasets'
import { act, screen } from '@testing-library/react'
import { DEFAULT_AES, GGVLine, setup } from './shared'
import { beakLengthsBySpecies } from './__data__/penguinSummaries'
import { GeomVLine } from '../geomVLine'
import { GeomPoint } from '../../../geom-point'
import { aaplMarketcap } from './__data__/aaplMarketcap'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}))

jest.useFakeTimers()

describe('a chart with vertical lines matches a snapshot', () => {
  it('with multiple settings', async () => {
    const { asFragment } = setup(
      <GGVLine data={penguins}>
        <GeomVLine
          data={beakLengthsBySpecies}
          aes={{
            x: d => d.count!,
          }}
          strokeDasharray='2,1'
        />
      </GGVLine>
    )

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('with another geom', async () => {
    const { user, asFragment } = setup(
      <GGVLine
        data={penguins.filter(d => DEFAULT_AES.x(d) && DEFAULT_AES?.y?.(d))}
        aes={{
          ...DEFAULT_AES,
          fill: d => d.species
        }}
      >
        <GeomVLine
          data={beakLengthsBySpecies}
          aes={{
            x: d => d.count!,
          }}
          strokeDasharray='2,1'
          showTooltip={false}
        />
        <GeomPoint />
      </GGVLine>
    )

    act(() => jest.runAllTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 250, clientY: 200 } })

    act(() => jest.runOnlyPendingTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('with global x aes mapping / x scale', async () => {
    const { asFragment } = setup(
      <GGVLine
        data={aaplMarketcap}
        aes={{
          x: d => new Date(d.date),
          y: d => d.marketCap
        }}
      >
        <GeomVLine
          data={[aaplMarketcap[45]]}
          strokeDasharray='2,1'
        />
      </GGVLine>
    )

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })
})