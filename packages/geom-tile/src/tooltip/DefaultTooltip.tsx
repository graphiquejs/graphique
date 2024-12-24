import React, { useState, useEffect } from 'react'
import {
  TooltipContent,
  TooltipContainer,
  formatMissing,
  labelsState,
  themeState,
  nodeToString,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

interface Props<Datum> {
  data: TooltipContent<Datum>[]
}

export const DefaultTooltip = <Datum,>({ data }: Props<Datum>) => {
  const [{ x: xLab, y: yLab }] = useAtom(labelsState)
  const [{ tooltip }] = useAtom(themeState)

  const [yLabel, setYLabel] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => setYLabel(nodeToString(yLab)))

    return () => clearTimeout(timeout)
  }, [yLab])

  return data ? (
    <TooltipContainer>
      {data.map((d) => {
        const formattedGroup = formatMissing(d.group)
        return (
          <div key={`group-tooltip-${d.label || formattedGroup}`}>
            <div
              style={{
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              {(d.label || d.group !== '__group') && (
                <>
                  {d.mark}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      fontWeight: 500,
                    }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize:
                            tooltip?.groupLabel?.fontSize ||
                            tooltip?.font?.size,
                        }}
                      >
                        {d.formattedMeasure || formattedGroup}
                      </span>
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', marginBottom: 2 }}>
                {xLab && (
                  <div
                    style={{
                      fontSize:
                        tooltip?.xLabel?.fontSize || tooltip?.font?.size,
                    }}
                  >
                    {`${xLab}:`}
                  </div>
                )}
                <div
                  style={{
                    marginLeft: 1,
                    fontWeight: 500,
                    fontSize:
                      tooltip?.xLabel?.fontSize ||
                      (tooltip?.font?.size || 12) + 1,
                  }}
                >
                  {d.formattedX}
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                {yLabel && (
                  <div
                    style={{
                      fontSize:
                        tooltip?.yLabel?.fontSize || tooltip?.font?.size,
                    }}
                  >
                    {`${yLabel}:`}
                  </div>
                )}
                <div
                  style={{
                    marginLeft: 1,
                    fontWeight: 500,
                    fontSize:
                      tooltip?.yLabel?.fontSize ||
                      (tooltip?.font?.size || 12) + 1,
                  }}
                >
                  {d.formattedY}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </TooltipContainer>
  ) : null
}
