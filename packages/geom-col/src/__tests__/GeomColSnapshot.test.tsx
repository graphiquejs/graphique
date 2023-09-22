import React from 'react'
import { GG, type Aes, type BarColPositions, Theme, Tooltip } from '@graphique/graphique'
import { screen, act } from '@testing-library/react'
import { Stock, stocks } from '@graphique/datasets'
import { GeomCol, Legend } from '..'
import { arrestsByDay, arrestsByDayAndCrime } from './__data__/crimeTotals'
import { CrimeTotal, DEFAULT_AES, GGCol, setup } from './shared'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}))

jest.useFakeTimers()

interface TestComponentProps {
  aes?: Aes
  data?: CrimeTotal[]
  position?: BarColPositions
  focusType?: 'group' | 'individual'
}

const TestComponent = ({
  aes = DEFAULT_AES,
  data = arrestsByDayAndCrime,
  position = 'stack',
  focusType = 'individual',
}: TestComponentProps) => (
  <GG
    data={data}
    aes={aes}
  >
    <GeomCol
      position={position}
      focusType={focusType}
      opacity={0.7}
    />
    <Tooltip position='top' />
    <Theme animationDuration={0} />
    <Legend title='Crime' orientation='horizontal' />
  </GG>
)

describe('column charts match snapshots', () => {
  it('simple columns', async () => {
    const { user, asFragment } = setup(
      <GGCol
        data={arrestsByDay}
        aes={{
          ...DEFAULT_AES,
          fill: undefined,
        }}
      >
        <GeomCol
          opacity={0.7}
        />
        <Tooltip position='top' />
        <Theme animationDuration={0} />
      </GGCol>
    )

    act(() => jest.runAllTimers())

    await screen.findAllByTestId('__gg_geom_col')

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('default (stacked) with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        focusType='group'
      />
    )

    await screen.findAllByTestId('__gg_geom_col')
    
    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('dodge with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        aes={{
          ...DEFAULT_AES,
          stroke: (d: CrimeTotal) => d.offenseCategory!,
        }}
        position='dodge'
      />
    )

    await screen.findAllByTestId('__gg_geom_col')
    
    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('fill with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        position='fill'
      />
    )

    await screen.findAllByTestId('__gg_geom_col')
    
    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('identity with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        focusType='group'
        position='identity'
      />
    )

    await screen.findAllByTestId('__gg_geom_col')
    
    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('continuous x scale', async () => {
    const { user, asFragment } = setup(
      <GGCol
        data={stocks.filter((d) => (
          d.symbol === 'AAPL' &&
          new Date(d.date) >= new Date('2019-07-01')
        ))}
        aes={{
          x: (d: Stock) => new Date(d.date),
          y: (d: Stock) => d.marketCap,
        }}
      >
        <GeomCol
          opacity={0.7}
          align='left'
          fill='steelblue'
        />
        <Tooltip position='top' />
      </GGCol>
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({ target: eventArea, coords: { clientX: 100, clientY: 200 } })
    await screen.findByTestId('__gg_x_tooltip')
    
    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })
})