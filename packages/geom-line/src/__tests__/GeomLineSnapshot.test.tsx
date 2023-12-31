import React from 'react'
import { GG, type Aes, Theme } from '@graphique/graphique'
import { screen, act } from '@testing-library/react'
import { GeomLine, Legend } from '..'
import { type Stock } from '../../../datasets'
import { undefinedYValData } from './__data__/discontinuousData'
import { setup } from './shared'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}))

jest.useFakeTimers()

const DEFAULT_AES: Aes<Stock> = {
  x: d => new Date(d.date),
  y: d => d.marketCap,
}

interface TestComponentProps {
  aes?: Aes<Stock>
  data?: Stock[]
}

const TestComponent = ({ aes = DEFAULT_AES, data = undefinedYValData }: TestComponentProps) => (
  <GG
    data={data}
    aes={aes}
  >
    <GeomLine
      strokeWidth='1.8'
      opacity={0.7}
    />
    <Theme animationDuration={0} />
    <Legend title='Stonks' orientation='horizontal' />
  </GG>
)

describe('a line chart matches a snapshot', () => {
  it('with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        aes={{
          ...DEFAULT_AES,
          stroke: d => d.symbol,
          strokeDasharray: d => d.symbol
        }}
      />
    )

    await screen.findAllByTestId('__gg_geom_line')
    
    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })

    act(() => jest.runOnlyPendingTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('for a single-line chart', async () => {
    const singleGroupData = undefinedYValData.filter(d => d.symbol === 'AAPL')

    const { user, asFragment } = setup(<TestComponent data={singleGroupData} />)

    await screen.findByTestId('__gg_geom_line')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })

    act(() => jest.runOnlyPendingTimers())

    expect(asFragment()).toMatchSnapshot()
  })
})