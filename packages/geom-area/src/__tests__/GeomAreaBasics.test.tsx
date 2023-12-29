/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { type Stock } from '@graphique/datasets'
import {
  DEFAULT_AREA_PROPS,
  DEFAULT_FILL,
  DEFAULT_GROUP_FILLS,
  GGArea,
  NUM_GROUPS,
  DEFAULT_AES,
  undefinedYValData,
} from './shared'
import { GeomArea } from '../geomArea'

jest.useFakeTimers()

const runBasicAreaChecks = async () => {
  act(() => jest.runAllTimers())

  // exists
  const chart = screen.queryByTestId('__gg_gg')
  expect(chart).toBeInTheDocument()

  // area ranges are there
  const areas = await screen.findAllByTestId('__gg_geom_area')
  expect(areas).toHaveLength(NUM_GROUPS)
  
  // with default fill colors
  const areaFills = areas.map(a => a.getAttribute('fill'))
  const hasSameNumFills = areaFills.length === DEFAULT_GROUP_FILLS.length
  expect(
    hasSameNumFills &&
      areaFills.every((fill, i) => fill === DEFAULT_GROUP_FILLS[i])
  ).toBeTruthy()
}

describe('area chart basics with GeomArea', () => {
  it('renders single area ranges for x,y aesthetic mappings', async () => {
    render(
      <GGArea
        {...DEFAULT_AREA_PROPS}
        data={DEFAULT_AREA_PROPS.data.filter(d => d.symbol === 'AAPL')}
        aes={{
          ...DEFAULT_AREA_PROPS.aes,
          fill: undefined
        }}
      />
    )

    act(() => jest.runAllTimers())

    // exists
    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    // singe area range is there
    const area = await screen.findByTestId('__gg_geom_area')
    expect(area).toBeInTheDocument()
    expect(area).toHaveAttribute('fill', DEFAULT_FILL)
  })
  
  it('renders multiple area ranges for x,y,fill aesthetic mappings', async () => {
    render(<GGArea {...DEFAULT_AREA_PROPS} />)

    runBasicAreaChecks()
  })

  it('renders multiple area ranges with y0,y1', async () => {
    render(
      <GGArea
        {...DEFAULT_AREA_PROPS}
        aes={{
          ...DEFAULT_AES,
          y: undefined,
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

    runBasicAreaChecks()
  })

  it('renders stacked areas as expected', async () => {
    render(
      <GGArea {...DEFAULT_AREA_PROPS}>
        <GeomArea position='stack' />
      </GGArea>
    )

    runBasicAreaChecks()
  })

  it('renders filled areas as expected', async () => {
    render(
      <GGArea {...DEFAULT_AREA_PROPS}>
        <GeomArea position='fill' />
      </GGArea>
    )

    runBasicAreaChecks()
  })

  it('renders discontinuous area paths when given missing y values', async () => {
    render(<GGArea {...DEFAULT_AREA_PROPS} data={undefinedYValData} />)

    runBasicAreaChecks()
  })

  it('has no areas when empty data', () => {
    render(<GGArea {...DEFAULT_AREA_PROPS} data={[]} />)

    const chart = screen.queryByTestId('__gg_gg')
    expect(chart).toBeInTheDocument()

    const areas = screen.queryAllByTestId('__gg_geom_area')
    expect(areas).toHaveLength(0)
  })

  it('throws error with misspecified y1 aes', () => {
    expect(() => {
      render(
        <GGArea {...DEFAULT_AREA_PROPS}>
          <GeomArea<Stock>
            aes={{
              y1: d => d.marketCap + (d.marketCap * 0.1)
            }}
          />
        </GGArea>
      )
    })
      .toThrowError('GeomArea: aes.y1 can only be specified when combined with aes.y0')
  })

  it('throws error with position="stack" + missing y aes', () => {
    expect(() => {
      render(
        <GGArea
          {...DEFAULT_AREA_PROPS}
          aes={{
            ...DEFAULT_AES,
            y: undefined
          }}
        >
          <GeomArea<Stock>
            aes={{
              y0: d => d.marketCap - (d.marketCap * 0.1),
              y1: d => d.marketCap + (d.marketCap * 0.1)
            }}
            position='stack'
          />
        </GGArea>
      )
    })
      .toThrowError('GeomArea: aes.y is required when using position="stack"')
  })
})