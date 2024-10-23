import React from 'react'
import { render, screen, act, within } from '@testing-library/react'
import type { Crime } from '@graphique/datasets'
import {
  GGTile,
  NUM_COLS,
  NUM_ROWS,
  THEFT,
  COLS,
  ROWS,
  setup,
  testTileData,
} from './shared'
import { GeomTile } from '../geomTile'

const FILL_TICKS = ['200', '400', '600', '800', '1,000']
const [HOVER_TILE_INDEX, CLICK_TILE_INDEX] = [5, 75]

const mockHoverData = [
  {
    offenseCategory: 'Theft',
    dow: 'Monday',
    hr: '11 am',
    count: 1058,
    gg_gen_index: HOVER_TILE_INDEX,
  },
]

const mockClickData = [
  {
    offenseCategory: 'Theft',
    dow: 'Thursday',
    hr: '9 am',
    count: 804,
    gg_gen_index: CLICK_TILE_INDEX,
  },
]

const createMissingMeasurement = (key: keyof Crime) =>
  testTileData.map((d) => {
    if (d.hr === '11 am' && d.dow === 'Wednesday') {
      return {
        ...d,
        [key]: null,
      }
    }
    return {
      ...d,
    }
  })

const mockOnDatumFocus = jest.fn()
const mockOnDatumSelection = jest.fn()
const mockOnMouseOut = jest.fn()

jest.useFakeTimers()

describe('GeomTile: basics', () => {
  it('renders a 2D heatmap correctly', async () => {
    render(<GGTile />)

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS)

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(NUM_ROWS)

    act(() => jest.runOnlyPendingTimers())

    xTickLabels.forEach((x, i) => expect(x).toHaveTextContent(COLS[i]))
    yTickLabels.forEach((y, i) => expect(y).toHaveTextContent(ROWS[i]))

    // has a legend
    const legend = await screen.findByTestId('__gg_geom_tile_legend')
    expect(legend).toBeVisible()

    expect(await within(legend).findByText(THEFT)).toBeVisible()
    expect(legend.querySelector('svg > image')).toBeVisible()

    FILL_TICKS.forEach((tick) => {
      expect(within(legend).getByText(tick)).toBeVisible()
    })
  })

  it('can handle missing fill mappings', async () => {
    const testDataWithMissingValue = createMissingMeasurement('count')

    render(<GGTile data={testDataWithMissingValue} />)

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS - 1)

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(NUM_ROWS)

    act(() => jest.runOnlyPendingTimers())

    xTickLabels.forEach((x, i) => expect(x).toHaveTextContent(COLS[i]))
    yTickLabels.forEach((y, i) => expect(y).toHaveTextContent(ROWS[i]))
  })

  it('can handle missing x mappings', async () => {
    const testDataWithMissingValue = createMissingMeasurement('hr')

    render(<GGTile data={testDataWithMissingValue} />)

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS - 1)

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(NUM_ROWS)

    act(() => jest.runOnlyPendingTimers())

    xTickLabels.forEach((x, i) => expect(x).toHaveTextContent(COLS[i]))
    yTickLabels.forEach((y, i) => expect(y).toHaveTextContent(ROWS[i]))
  })

  it('can handle missing y mappings', async () => {
    const testDataWithMissingValue = createMissingMeasurement('dow')

    render(<GGTile data={testDataWithMissingValue} />)

    // exists w/ right number of tiles
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const tiles = await screen.findAllByTestId('__gg_geom_tile')
    expect(tiles.length).toBe(NUM_COLS * NUM_ROWS - 1)

    // renders x/y tick labels
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    const yTickLabels = await screen.findAllByTestId('__gg_y_tick_label')
    expect(yTickLabels).toHaveLength(NUM_ROWS)

    act(() => jest.runOnlyPendingTimers())

    xTickLabels.forEach((x, i) => expect(x).toHaveTextContent(COLS[i]))
    yTickLabels.forEach((y, i) => expect(y).toHaveTextContent(ROWS[i]))
  })

  it('has working callbacks for interactions', async () => {
    const { user } = setup(
      <GGTile>
        <GeomTile<Crime>
          onDatumFocus={mockOnDatumFocus}
          onDatumSelection={mockOnDatumSelection}
          onExit={mockOnMouseOut}
        />
      </GGTile>,
    )

    await screen.findByTestId('__gg_gg')
    await screen.findAllByTestId('__gg_geom_tile')

    act(() => jest.runOnlyPendingTimers())

    // hover/focus
    const hoverVoronoiCell = screen.getByTestId(
      `__gg_event_voronoi_${HOVER_TILE_INDEX}`,
    )
    expect(hoverVoronoiCell).toBeVisible()

    await user.hover(hoverVoronoiCell)

    act(() => jest.runOnlyPendingTimers())

    expect(mockOnDatumFocus).toHaveBeenCalledWith(mockHoverData, [
      HOVER_TILE_INDEX,
    ])

    // click/select
    const eventArea = await screen.findByTestId('__gg_event_area')

    await user.pointer({
      target: eventArea,
      coords: { clientX: 100, clientY: 200 },
    })

    await user.click(eventArea)

    act(() => jest.runOnlyPendingTimers())

    expect(mockOnDatumSelection).toHaveBeenCalledWith(mockClickData, [
      CLICK_TILE_INDEX,
    ])

    // mouseout
    await user.pointer({
      target: eventArea,
      coords: { clientX: 0, clientY: 0 },
    })

    expect(mockOnMouseOut).toHaveBeenCalled()
  })
})
