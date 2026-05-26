/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { render, act } from '@testing-library/react'
import { type Stock } from '@graphique/datasets'
import { Zoom, yScaleState, BrushAction } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { DEFAULT_AREA_PROPS, GGArea } from './shared'
import { GeomArea } from '../geomArea'

jest.useFakeTimers()

const YScaleInspector = ({
  onDomain,
}: {
  onDomain: (domain: any) => void
}) => {
  const [{ domain }] = useAtom(yScaleState)
  React.useEffect(() => {
    onDomain(domain)
  }, [domain])
  return null
}

describe('GeomArea zoom behavior', () => {
  it('preserves y-axis domain from zoom state instead of recalculating from x-filtered data', async () => {
    const zoomedYDomain = [20, 80]
    let capturedDomain: any

    const data = DEFAULT_AREA_PROPS.data.filter(
      (d) => d.symbol === 'AAPL',
    )
    const xValues = data.map((d) => new Date(d.date).getTime())
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const xMid = xMin + (xMax - xMin) / 2

    render(
      <GGArea
        data={data}
        aes={{
          ...DEFAULT_AREA_PROPS.aes,
          fill: undefined,
        }}
      >
        <GeomArea<Stock> brushAction={BrushAction.ZOOM} />
        <Zoom
          xDomain={[new Date(xMid), new Date(xMax)]}
          yDomain={zoomedYDomain}
        />
        <YScaleInspector onDomain={(d) => { capturedDomain = d }} />
      </GGArea>,
    )

    act(() => jest.runOnlyPendingTimers())

    expect(capturedDomain).toEqual(zoomedYDomain)
  })
})
