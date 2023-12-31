import React from 'react'
import { useAtom } from 'jotai'
import {
  labelsState,
  TooltipContent,
  TooltipContainer,
  themeState,
} from '@graphique/graphique'

interface Props<Datum> {
  data: TooltipContent<Datum>[]
}

export const DefaultTooltip = <Datum,>({ data }: Props<Datum>) => {
  const [{ x: xLab }] = useAtom(labelsState)
  const [{ tooltip }] = useAtom(themeState)

  return data ? (
    <TooltipContainer>
      {data.map(d => (
        <div key={`group-tooltip-${d.label ?? ''}`}>
          <div
            style={{
              marginTop: 4,
              marginBottom: 4,
            }}
          >
            {d.label && (
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
                          tooltip?.groupLabel?.fontSize || tooltip?.font?.size,
                      }}
                    >
                      {d.formattedMeasure}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div
              style={{
                display: 'flex',
                marginBottom: 2,
                alignItems: 'flex-end',
              }}
            >
              {d.label ? (
                <div
                  style={{
                    fontSize:
                      tooltip?.groupLabel?.fontSize || tooltip?.font?.size,
                    marginRight: 2,
                  }}
                >
                  {`${d.label}:`}
                </div>
              ) : (
                xLab && (
                  <div
                    style={{
                      fontSize:
                        tooltip?.groupLabel?.fontSize || tooltip?.font?.size,
                      marginRight: 2,
                    }}
                  >
                    {`${xLab}:`}
                  </div>
                )
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
          </div>
        </div>
      ))}
    </TooltipContainer>
  ) : null
}
