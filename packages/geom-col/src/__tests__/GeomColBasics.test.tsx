import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { arrestsByDay } from './__data__/crimeTotals'
import {
  GGCol,
  DEFAULT_AES,
  COLS,
  NUM_COLS,
  NUM_GROUPS,
  DEFAULT_FILL,
  DEFAULT_GROUP_FILLS,
} from './shared'
import { GeomCol } from '../geomCol'

jest.useFakeTimers()

describe('column chart basics with GeomCol', () => {
  it('renders single columns for categorical x and continuous y values', async () => {
    render(
      <GGCol
        data={arrestsByDay}
        aes={{
          ...DEFAULT_AES,
          fill: undefined,
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // columns look good
    const columns = await screen.findAllByTestId('__gg_geom_col')
    expect(columns).toHaveLength(NUM_COLS)
    columns.forEach((col) => {
      expect(col).toHaveAttribute('fill', DEFAULT_FILL)
    })

    // columns are labeled with group strings
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    xTickLabels.forEach((label, i) => {
      expect(label).toHaveTextContent(COLS[i])
    })

    screen.logTestingPlaygroundURL()
  })
  
  it('renders stacked (default) columns as expected', async () => {
    render(<GGCol />)
    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // a column segment for each col-group combo created by x,fill aesthetics
    const colGroups = await screen.findAllByTestId('__gg_geom_col')
    expect(colGroups).toHaveLength(NUM_COLS * NUM_GROUPS)

    // columns are labeled by the x axis with group strings
    const xTickLabels = await screen.findAllByTestId('__gg_x_tick_label')
    expect(xTickLabels).toHaveLength(NUM_COLS)

    xTickLabels.forEach((label, i) => {
      expect(label).toHaveTextContent(COLS[i])
    })

    // column groups/segments are filled with default colors
    colGroups.forEach((group, i) => {
      const colIndex = (i / NUM_GROUPS) % NUM_COLS
      expect(group).toHaveAttribute('fill', DEFAULT_GROUP_FILLS[colIndex])
    })
  })

  it('renders dodged (side-by-side) columns as expected', async () => {
    render(
      <GGCol>
        <GeomCol position='dodge' />
      </GGCol>
    )

    act(() => jest.runAllTimers())

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const colGroups = await screen.findAllByTestId('__gg_geom_col')
    expect(colGroups).toHaveLength(NUM_COLS * NUM_GROUPS)

    // column groups/segments are filled with default colors
    colGroups.forEach((group, i) => {
      const colIndex = (i / NUM_GROUPS) % NUM_COLS
      expect(group).toHaveAttribute('fill', DEFAULT_GROUP_FILLS[colIndex])
    })
  })

  it('renders filled (relative y-scaled) columns as expected', async () => {
    render(
      <GGCol>
        <GeomCol position='fill' />
      </GGCol>
    )

    act(() => jest.runAllTimers())

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const colGroups = await screen.findAllByTestId('__gg_geom_col')
    expect(colGroups).toHaveLength(NUM_COLS * NUM_GROUPS)

    // column groups/segments are filled with default colors
    colGroups.forEach((group, i) => {
      const colIndex = (i / NUM_GROUPS) % NUM_COLS
      expect(group).toHaveAttribute('fill', DEFAULT_GROUP_FILLS[colIndex])
    })
  })

  it('renders identity positioned (overlaid) columns as expected', async () => {
    render(
      <GGCol>
        <GeomCol position='identity' />
      </GGCol>
    )

    act(() => jest.runAllTimers())

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const colGroups = await screen.findAllByTestId('__gg_geom_col')
    expect(colGroups).toHaveLength(NUM_COLS * NUM_GROUPS)

    // column groups/segments are filled with default colors
    colGroups.forEach((group, i) => {
      const colIndex = (i / NUM_GROUPS) % NUM_COLS
      expect(group).toHaveAttribute('fill', DEFAULT_GROUP_FILLS[colIndex])
    })
  })

  it('has no columns when empty data', () => {
    render(<GGCol data={[]} />)

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const columns = screen.queryAllByTestId('__gg_geom_col')
    expect(columns).toHaveLength(0)
  })

  it('renders correctly with local aesthetics and data', async () => {
    render(
      <GGCol
        aes={{ x: DEFAULT_AES.x }}
      >
        <GeomCol
          aes={{
            y: DEFAULT_AES.y,
            fill: DEFAULT_AES.fill
          }}
        />
      </GGCol>
    )

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const columns = await screen.findAllByTestId('__gg_geom_col')
    expect(columns).toHaveLength(NUM_COLS * NUM_GROUPS)
  })
})