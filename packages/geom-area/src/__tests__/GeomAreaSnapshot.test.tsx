/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { type Stock } from '@graphique/datasets'
import {
  GG,
  Theme,
  type DataValue,
  type AreaPositions,
  type Aes,
} from '@graphique/graphique'
import { act, screen } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'
import { DEFAULT_AES, DEFAULT_DATA, setup, undefinedYValData } from './shared'
import { GeomArea, Legend } from '..'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}))

jest.useFakeTimers()

interface TestComponentProps {
  aes?: Aes<Stock>
  data?: Stock[]
  position?: AreaPositions
  y0?: DataValue<Stock>
  y1?: DataValue<Stock>
}

const TestComponent = ({
  aes = DEFAULT_AES,
  data = DEFAULT_DATA,
  position = 'identity',
  y0,
  y1,
}: TestComponentProps) => (
  <GG
    data={data}
    aes={aes}
    margin={{ left: 50 }}
  >
    <GeomArea
      position={position}
      opacity={0.5}
      aes={{ y0, y1 }}
    />
    <Theme animationDuration={0} />
    <Legend title='Stocks' orientation='horizontal' />
  </GG>
)

const prepareTesting = async (user: UserEvent) => {
  act(() => jest.runAllTimers())

  await screen.findAllByTestId('__gg_geom_area')

  const eventArea = await screen.findByTestId('__gg_event_area')
  await user.pointer({ target: eventArea, coords: { clientX: 200, clientY: 200 } })
  await screen.findByTestId('__gg_x_tooltip')
  
  act(() => jest.runOnlyPendingTimers())
}

describe('area charts match snapshots', () => {
  it('simple, single area', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        data={DEFAULT_DATA.filter(d => d.symbol === 'AAPL')}
        aes={{
          ...DEFAULT_AES,
          fill: undefined
        }}
      />
    )

    await prepareTesting(user)
    expect(asFragment()).toMatchSnapshot()
  })

  it('position="identity" (default), filled', async () => {
    const { user, asFragment } = setup(<TestComponent />)
    await prepareTesting(user)

    expect(asFragment()).toMatchSnapshot()
  })

  it('position="stack", filled', async () => {
    const { user, asFragment } = setup(
      <TestComponent position='stack' />
    )
    await prepareTesting(user)

    expect(asFragment()).toMatchSnapshot()
  })

  it('position="fill", filled', async () => {
    const { user, asFragment } = setup(
      <TestComponent position='fill' />
    )
    await prepareTesting(user)
    
    expect(asFragment()).toMatchSnapshot()
  })

  it('y0, y1 set — grouped "ribbons"', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        aes={{
          ...DEFAULT_AES,
          y: undefined,
        }}
        y0={d => d.marketCap - (d.marketCap * 0.1)}
        y1={d => d.marketCap + (d.marketCap * 0.1)}
      />
    )
    await prepareTesting(user)
    
    expect(asFragment()).toMatchSnapshot()
  })

  it('discontinuous data, filled', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        position='stack'
        data={undefinedYValData}
      />
    )
    await prepareTesting(user)
    
    expect(asFragment()).toMatchSnapshot()
  })
})