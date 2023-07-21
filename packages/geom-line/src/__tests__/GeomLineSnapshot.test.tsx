import React from 'react'
import { GG, Theme, Tooltip } from '@graphique/graphique'
import { render, screen } from '@testing-library/react'
import { GeomLine, Legend } from '..'
import { type Stock } from '../../../datasets'
import { undefinedYValData } from './__data__/discontinuousData'

// useful for controlling the randomly-generated ID given to graphique objects
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id')
}));

const focusedData = undefinedYValData.filter((d) => d.date === '10/10/2018')

const TestComponent = () => render(
  <GG
    data={undefinedYValData}
    aes={{
      x: (d: Stock) => new Date(d.date),
      y: (d: Stock) => d.marketCap,
      stroke: (d: Stock) => d.symbol,
      strokeDasharray: (d: Stock) => d.symbol
    }}
  >
    <GeomLine
      strokeWidth='1.8'
      opacity={0.7}
    />
    <Legend title='Stonks' orientation='horizontal' />
    <Tooltip datum={focusedData} />
    <Theme animationDuration={0} />
  </GG>
)

describe('a line chart matches a snapshot', () => {
  it('matches a snapshot of a line chart with multiple settings', async () => {
    const { asFragment } = TestComponent()

    await screen.findAllByTestId('__gg_geom_line')
    expect(asFragment()).toMatchSnapshot()
  })
})