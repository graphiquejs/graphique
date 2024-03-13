/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { type Stock } from '@graphique/datasets'
import {
  DEFAULT_AREA_PROPS,
  DEFAULT_GROUP_FILLS,
  GGArea,
  NUM_GROUPS,
  DEFAULT_AES,
} from './shared'
import { GeomArea } from '../geomArea'

jest.useFakeTimers()

const NUM_DERIVED_FILLS = 2

describe('area chart complexities with GeomArea', () => {
  it('renders area chart with combinations of groups/fills', async () => {
    render(
      <GGArea
        {...DEFAULT_AREA_PROPS}
        aes={{
          x: DEFAULT_AES.x,
          y: undefined,
          group: d => d.symbol,
          fill: d => String(d.symbol.startsWith('M'))
        }}
      >
        <GeomArea<Stock>
          aes={{
            y0: d => d.marketCap - (d.marketCap * 0.1),
            y1: d => d.marketCap + (d.marketCap * 0.1) 
          }}
        />
      </GGArea>
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // area ranges are there
    const areas = await screen.findAllByTestId('__gg_geom_area')
    expect(areas).toHaveLength(NUM_GROUPS)
    
    // with default fill colors
    const areaFills = Array.from(new Set(areas.map(a => a.getAttribute('fill'))))
    const hasSameNumFills = areaFills.length === NUM_DERIVED_FILLS
    expect(
      hasSameNumFills &&
        areaFills.every((fill, i) => fill === DEFAULT_GROUP_FILLS[i])
    ).toBeTruthy()
  })
})