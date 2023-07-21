import React from 'react'
import { screen, act, within } from '@testing-library/react'
import { type Aes } from '@graphique/graphique'
import { stocks, Stock } from '@graphique/datasets'
import { GeomLine } from '..'
import { 
  GGLine,
  DEFAULT_DASHARRAYS,
  DEFAULT_AES,
  setup,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  GROUPS
} from './shared'

const EXPECTED_TOOLTIP_DATUM: Stock[] = []
const EXPECTED_DATUM_INDICES: number[] = []
stocks.forEach((d, i) => {
  const isIncluded = d.date === '4/28/2019'

  if (isIncluded) {
    EXPECTED_DATUM_INDICES.push(i)
    EXPECTED_TOOLTIP_DATUM.push(d)
  }
})

const FORMATTED_DATE = 'Apr 28, 2019'

interface Props {
  aes?: typeof DEFAULT_AES
}

const aesthetics: Aes = {
  ...DEFAULT_AES,
  strokeDasharray: DEFAULT_AES.stroke
}

const GGLineTooltip: React.FC<Props> = ({ aes = aesthetics, children = <GeomLine /> }) => (
  <GGLine aes={aes}>
    {children}
  </GGLine>
)

jest.useFakeTimers()
const mockOnExit = jest.fn()
const mockOnDatumFocus = jest.fn()
 
describe("GeomLine's Tooltip", () => {
  it('shows up correctly based on mouse interactions', async () => {
    const { user } = setup(
      <GGLineTooltip
        aes={{
          ...DEFAULT_AES,
          strokeDasharray: DEFAULT_AES.stroke
        }}
      />
    )

    await screen.findByTestId('__gg_gg')
    await screen.findAllByTestId('__gg_geom_line')

    act(() => jest.runOnlyPendingTimers())

    const eventArea = screen.getByTestId('__gg_event_area')
    expect(eventArea).toBeInTheDocument()

    const tooltipPortal = screen.getByTestId('__gg_y_tooltip')
    expect(tooltipPortal.children).toHaveLength(0)

    await user.pointer({ target: eventArea, coords: { clientX: 200, clientY: 200 } })
    expect(tooltipPortal.children.length).toBeGreaterThan(0)

    act(() => jest.runOnlyPendingTimers())

    const lineMarker = await screen.findByTestId('__gg_geom_line_marker')
    const markerPoints = await screen.findAllByTestId('__gg_geom_line_marker_point')
    const tooltipGroupLines = tooltipPortal.querySelectorAll('line')

    // line marker w/ groups
    expect(lineMarker).toBeInTheDocument()
    expect(markerPoints).toHaveLength(NUM_GROUPS)
    expect(tooltipGroupLines).toHaveLength(NUM_GROUPS)

    // tooltip content
    expect(within(tooltipPortal).getByText(FORMATTED_DATE)).toBeInTheDocument()

    GROUPS.forEach((group, i) => {
      const expectedColor = DEFAULT_GROUP_STROKES[i]
      const expectedDasharray = DEFAULT_DASHARRAYS[i]
      const markerPoint = markerPoints[i]
      const tooltipGroupLine = tooltipGroupLines[i]
      const datum = EXPECTED_TOOLTIP_DATUM.find(d => d.symbol === group)
      const formattedYValue = datum?.marketCap.toLocaleString(undefined, { maximumFractionDigits: 2 })

      // group visual indicators
      expect(markerPoint).toHaveAttribute('fill', expectedColor)
      expect(within(tooltipPortal).getByText(group)).toBeInTheDocument()
      expect(tooltipGroupLine).toHaveAttribute('stroke', expectedColor)
      expect(tooltipGroupLine).toHaveAttribute('stroke-dasharray', expectedDasharray)

      // group data pieces
      expect(within(tooltipPortal).getByText(group)).toBeInTheDocument()
      expect(formattedYValue && within(tooltipPortal).getByText(formattedYValue)).toBeInTheDocument()
    })
    
    // goes away on mouseleave
    await user.unhover(eventArea)
    act(() => jest.runOnlyPendingTimers())

    expect(tooltipPortal.children).toHaveLength(0)
    expect(lineMarker).not.toBeInTheDocument()
    expect(screen.queryAllByTestId('__gg_geom_line_marker_point')).toHaveLength(0)
  })

  it('registers callbacks for mouse events', async () => {
    const { user } = setup(
      <GGLineTooltip>
        <GeomLine
          onExit={mockOnExit}
          onDatumFocus={mockOnDatumFocus}
        />
      </GGLineTooltip>
    )
    const chart = await screen.findByTestId('__gg_gg')
    await screen.findAllByTestId('__gg_geom_line')

    act(() => jest.runOnlyPendingTimers())

    const voronoiCells = await screen.findAllByTestId(/__gg_event_voronoi/)

    await user.hover(voronoiCells[EXPECTED_DATUM_INDICES[0]])
    expect(mockOnDatumFocus).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining(EXPECTED_TOOLTIP_DATUM[0])
      ]),
      expect.arrayContaining(EXPECTED_DATUM_INDICES)
    )

    await user.unhover(chart)
    expect(mockOnExit).toHaveBeenCalled()
  })
})