import React from 'react'
import { penguins } from '@graphique/datasets'
import { act, screen } from '@testing-library/react'
import {
  GGHLine,
  DEFAULT_AES,
  flipperLengthsBySpecies,
  setup
} from './shared'
import { GeomHLine } from '../geomHLine'
import { GeomPoint } from '../../../geom-point/dist'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}))

jest.useFakeTimers()

describe('a chart with vertical lines matches a snapshot', () => {
  it('with multiple settings', async () => {
    const { asFragment } = setup(
      <GGHLine data={penguins}>
        <GeomHLine
          data={flipperLengthsBySpecies}
          aes={{
            y: d => d.count!
          }}
          strokeDasharray='2,1'
        />
      </GGHLine>
    )

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('with another geom', async () => {
    const { user, asFragment } = setup(
      <GGHLine
        data={penguins.filter(d => DEFAULT_AES.x(d) && DEFAULT_AES?.y?.(d))}
        aes={{
          ...DEFAULT_AES,
          fill: d => d.species
        }}
      >
        <GeomHLine
          data={flipperLengthsBySpecies}
          aes={{
            y: d => d.count!,
          }}
          strokeDasharray='2,1'
          showTooltip={false}
        />
        <GeomPoint />
      </GGHLine>
    )

    act(() => jest.runAllTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 250, clientY: 200 } })

    act(() => jest.runOnlyPendingTimers())
    
    expect(asFragment()).toMatchSnapshot()
  })
})