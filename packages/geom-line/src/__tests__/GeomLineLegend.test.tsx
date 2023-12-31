/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { ScaleStroke } from '@graphique/graphique'
import { schemeDark2 } from 'd3-scale-chromatic'
import { GeomLine, Legend } from '..'
import {
  GGLine,
  GROUPS,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_AES,
  DEFAULT_SINGLE_STROKE,
  DEFAULT_DASHARRAYS,
  setup
} from './shared'

const [FOCUSED_OPACITY, UNFOCUSED_OPACITY] = ['1', '0.5']

interface Props {
  aes?: typeof DEFAULT_AES
}

const GGLineLegend: React.FC<Props> = ({ aes = DEFAULT_AES, children = <Legend /> }) => (
  <GGLine aes={aes}>
    <GeomLine />
    {children}
  </GGLine>
)

beforeEach(() => {
  jest.clearAllTimers()
})

jest.useFakeTimers()
const mockSelection = jest.fn()

describe("GeomLine's legend", () => {
  it('renders with defaults when stroke aesthetic is provided', async () => {
    render(<GGLineLegend />)

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    expect(legend).toBeInTheDocument()

    const legendItems = await within(legend).findAllByRole('button')
    expect(legendItems).toHaveLength(NUM_GROUPS)

    // has labels for each item
    const legendLabels = legendItems.map(l => l.textContent)
    expect(legendLabels.every((l, i) => l === GROUPS[i])).toBeTruthy()

    // has markers for each item
    legendItems.forEach((l, i) => {
      const lineMarker = l.querySelector('line')
      expect(lineMarker).toBeInTheDocument()
      expect(lineMarker?.getAttribute('stroke')).toBe(DEFAULT_GROUP_STROKES[i])
      expect(lineMarker?.getAttribute('stroke-width')).toBe(DEFAULT_STROKE_WIDTH)
    })

    // default vertical appearance
    const legendStyles = window.getComputedStyle(legend)
    expect(legendStyles.flexDirection).toBe('column')
  })

  it('draws a strokeDasharray-only legend when it should', async () => {
    render(
      <GGLineLegend
        aes={{
          ...DEFAULT_AES,
          stroke: undefined,
          strokeDasharray: d => d.symbol,
        }}
      />
    )
    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')
    const lineMarkers = legendItems.map(l => l.querySelector('line'))

    expect(lineMarkers).toHaveLength(NUM_GROUPS)

    // line markers have the right dasharray values
    lineMarkers.forEach((l, i) => {
      expect(l).toHaveAttribute('stroke-dasharray', DEFAULT_DASHARRAYS[i])
      expect(l?.getAttribute('stroke')).toBe(DEFAULT_SINGLE_STROKE)
    })
  })

  it('draws legend items horizontally when it should', async () => {
    render(
      <GGLineLegend>
        <Legend orientation='horizontal' />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendStyles = window.getComputedStyle(legend)

    expect(legendStyles.flexDirection).toBe('row')
  })

  it('has a working title', async () => {
    const titleText = 'Stonks'

    render(
      <GGLineLegend>
        <Legend title={<h1>{titleText}</h1>} />
      </GGLineLegend>
    )

    const legendTitle = await screen.findByText(titleText, { selector: 'h1' })
    expect(legendTitle).toBeInTheDocument()
  })

  it('allows custom string formatting for labels', async () => {
    const testLabel = 'test-label'

    render(
      <GGLineLegend>
        <Legend
          format={(v, i) => `${v}-${testLabel}-${i}`}
        />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')

    // has custom labels for each item
    expect(
      legendItems.every((l, i) => (
        l.textContent === `${GROUPS[i]}-${testLabel}-${i}`
      ))
    ).toBeTruthy()
  })

  it('allows dasharray to be ignored', async () => {
    render(
      <GGLineLegend
        aes={{
          ...DEFAULT_AES,
          strokeDasharray: d => d.symbol,
        }}
      >
        <Legend ignoreDasharray />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')

    // line markers do not have dasharrays
    legendItems.forEach((l) => {
      const lineMarker = l.querySelector('line')

      expect(lineMarker).toBeInTheDocument()
      expect(lineMarker).not.toHaveAttribute('stroke-dasharray')
    })
  })

  it('acts as a filter with callbacks when clicking legend items', async () => {
    const { user } = setup(
      <GGLineLegend>
        <Legend onSelection={mockSelection} />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')
    let lines = await screen.findAllByTestId('__gg_geom_line')

    // before selection
    expect(lines).toHaveLength(NUM_GROUPS)

    expect(legendItems.every(l => {
      const itemStyles = window.getComputedStyle(l)
      return itemStyles.opacity === FOCUSED_OPACITY
    })).toBeTruthy()

    // selecting each legend item sequentially
    // 1. filters the data (lines in the chart)
    // 2. executes onSelection callback
    // 3. adjusts the appearance of focused/unfocused legend items (opacity)

    for (const [i, l] of legendItems.entries()) {
      const label = l.textContent

      await user.click(l)
      expect(mockSelection).toHaveBeenLastCalledWith(label)

      lines = await screen.findAllByTestId('__gg_geom_line')
      const modifiedLegendItems = await within(legend).findAllByRole('button')

      if (i < NUM_GROUPS - 1) {
        expect(lines).toHaveLength(NUM_GROUPS - (i + 1))
        
        const itemStyles = window.getComputedStyle(modifiedLegendItems[i])
        const notYetSelectedItems = modifiedLegendItems.filter((_, j) => j > i)
          
        expect(itemStyles.opacity).toBe(UNFOCUSED_OPACITY)
        expect(
          notYetSelectedItems.every(item => window.getComputedStyle(item).opacity === FOCUSED_OPACITY)
        ).toBeTruthy()
      } else {
        // reset selections and appearances when selecting the last legend item
        expect(lines).toHaveLength(NUM_GROUPS)
        expect(
          modifiedLegendItems.every((item) => window.getComputedStyle(item).opacity === FOCUSED_OPACITY)
        ).toBeTruthy()
      }
    }
  })

  it('acts as a filter with callbacks when selecting via keyboard', async () => {
    const { user } = setup(
      <GGLineLegend>
        <Legend onSelection={mockSelection} />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')
    let lines = await screen.findAllByTestId('__gg_geom_line')

    // before selection
    expect(lines).toHaveLength(NUM_GROUPS)

    expect(legendItems.every(l => {
      const itemStyles = window.getComputedStyle(l)
      return itemStyles.opacity === FOCUSED_OPACITY
    })).toBeTruthy()

    // selecting each legend item sequentially
    // 1. filters the data (lines in the chart)
    // 2. executes onSelection callback
    // 3. adjusts the appearance of focused/unfocused legend items (opacity)

    // eslint-disable-next-line no-restricted-syntax
    for (const [i, l] of legendItems.entries()) {
      const label = l.textContent

      l.focus()
      await user.keyboard(' ')

      expect(mockSelection).toHaveBeenLastCalledWith(label)

      lines = await screen.findAllByTestId('__gg_geom_line')
      const modifiedLegendItems = await within(legend).findAllByRole('button')

      if (i < NUM_GROUPS - 1) {
        expect(lines).toHaveLength(NUM_GROUPS - (i + 1))
        
        const itemStyles = window.getComputedStyle(modifiedLegendItems[i])
        const notYetSelectedItems = modifiedLegendItems.filter((_, j) => j > i)
          
        expect(itemStyles.opacity).toBe(UNFOCUSED_OPACITY)
        expect(
          notYetSelectedItems.every(item => window.getComputedStyle(item).opacity === FOCUSED_OPACITY)
        ).toBeTruthy()
      } else {
        // reset selections and appearances when selecting the last legend item
        expect(lines).toHaveLength(NUM_GROUPS)
        expect(
          modifiedLegendItems.every((item) => window.getComputedStyle(item).opacity === FOCUSED_OPACITY)
        ).toBeTruthy()
      }
    }
  })

  it('can incorporate a custom scale', async () => {
    const groupsNotInData = ['NVDA', 'TSLA'] // not in data
    const customDomain = [...groupsNotInData, ...GROUPS]

    const { user } = setup(
      <GGLineLegend>
        <Legend onSelection={mockSelection}/>
        <ScaleStroke
          domain={customDomain}
          values={schemeDark2}
        />
      </GGLineLegend>
    )

    const legend = await screen.findByTestId('__gg_geom_line_legend')
    const legendItems = await within(legend).findAllByRole('button')

    let lines = await screen.findAllByTestId('__gg_geom_line')
    expect(lines).toHaveLength(NUM_GROUPS)

    for (const [i, l] of legendItems.entries()) {
      const { opacity } = window.getComputedStyle(l)
      const stroke = l.querySelector('line')?.getAttribute('stroke')
      const label = l.textContent
      const isInData = l.textContent && GROUPS.includes(l.textContent)

      expect(stroke).toBe(schemeDark2[i])
      expect(opacity).toBe(isInData ? FOCUSED_OPACITY : UNFOCUSED_OPACITY)

      // clicking a group not in data only registers the onSelection callback
      await user.click(l)
      expect(mockSelection).toHaveBeenLastCalledWith(label)

      lines = await screen.findAllByTestId('__gg_geom_line')
      const modifiedLegendItems = await within(legend).findAllByRole('button')

      if (label && groupsNotInData.includes(label)) {
        expect(lines).toHaveLength(NUM_GROUPS)
      } else if (i < (customDomain.length - 1)) {
        expect(lines).toHaveLength(customDomain.length - (i + 1))
        
        const itemStyles = window.getComputedStyle(modifiedLegendItems[i])
        const notYetSelectedItems = modifiedLegendItems.filter((_, j) => j > i)
          
        expect(itemStyles.opacity).toBe(UNFOCUSED_OPACITY)
        expect(
          notYetSelectedItems.every(item => window.getComputedStyle(item).opacity === FOCUSED_OPACITY)
        ).toBeTruthy()
      } else {
        // reset selections and appearances when selecting the last legend item
        expect(lines).toHaveLength(NUM_GROUPS)
        expect(
          modifiedLegendItems.every(item => {
            const thisLabel = item.textContent
            const thisOpacity = window.getComputedStyle(item).opacity

            if (thisLabel && groupsNotInData.includes(thisLabel))
              return thisOpacity === UNFOCUSED_OPACITY
            
            return thisOpacity === FOCUSED_OPACITY
          })
        ).toBeTruthy()
      }
    }
  })
})