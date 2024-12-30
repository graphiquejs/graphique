import React from 'react'
import {
  GG,
  type Aes,
  Theme,
  Tooltip,
  LegendOrientation,
  TooltipPosition,
} from '@graphique/graphique'
import { screen, act } from '@testing-library/react'
import { stocks } from '@graphique/datasets'
import { GeomCol, Legend, Position, Alignment, FocusType } from '..'
import { arrestsByDay, arrestsByDayAndCrime } from './__data__/crimeTotals'
import { type CrimeCount, DEFAULT_AES, GGCol, setup } from './shared'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id'),
}))

jest.useFakeTimers()

interface TestComponentProps<CrimeTotal> {
  aes?: Aes<CrimeTotal>
  data?: CrimeTotal[]
  position?: Position
  focusType?: FocusType
}

const TestComponent = ({
  aes = DEFAULT_AES,
  data = arrestsByDayAndCrime,
  position,
  focusType = FocusType.INDIVIDUAL,
}: TestComponentProps<CrimeCount>) => (
  <GG data={data} aes={aes}>
    <GeomCol
      position={position}
      focusType={focusType}
      attr={{ opacity: 0.7 }}
    />
    <Tooltip position={TooltipPosition.TOP} />
    <Theme animationDuration={0} />
    <Legend title="Crime" orientation={LegendOrientation.H} />
  </GG>
)

xdescribe('column charts match snapshots', () => {
  it('simple columns', async () => {
    const { user, asFragment } = setup(
      <GGCol
        data={arrestsByDay}
        aes={{
          ...DEFAULT_AES,
          fill: undefined,
        }}
      >
        <GeomCol attr={{ opacity: 0.7 }} />
        <Tooltip position={TooltipPosition.TOP} />
        <Theme animationDuration={0} />
      </GGCol>,
    )

    act(() => jest.runAllTimers())

    await screen.findAllByTestId('__gg_geom_col')

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('default (stacked) with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent focusType={FocusType.GROUP} />,
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('dodge with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        aes={{
          ...DEFAULT_AES,
          stroke: (d) => d.offenseCategory!,
        }}
        position={Position.DODGE}
      />,
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('fill with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent position={Position.FILL} />,
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('identity with multiple settings', async () => {
    const { user, asFragment } = setup(
      <TestComponent
        focusType={FocusType.GROUP}
        position={Position.IDENTITY}
      />,
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })

  it('continuous x scale', async () => {
    const { user, asFragment } = setup(
      <GGCol
        data={stocks.filter(
          (d) =>
            d.symbol === 'AAPL' && new Date(d.date) >= new Date('2019-07-01'),
        )}
        aes={{
          x: (d) => new Date(d.date),
          y: (d) => d.marketCap,
        }}
      >
        <GeomCol
          attr={{ opacity: 0.7, fill: 'steelblue' }}
          align={Alignment.LEFT}
        />
        <Tooltip position={TooltipPosition.TOP} />
      </GGCol>,
    )

    await screen.findAllByTestId('__gg_geom_col')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = await screen.findByTestId('__gg_event_area')
    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })
    await screen.findByTestId('__gg_x_tooltip')

    act(() => jest.runAllTimers())

    expect(asFragment()).toMatchSnapshot()
  })
})
