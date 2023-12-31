import React from 'react'
import {
  TooltipContent,
  TooltipContainer,
  formatMissing,
  themeState,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

interface Props<Datum> {
  data: TooltipContent<Datum>[]
}

export const DefaultTooltip = <Datum,>({ data }: Props<Datum>) => {
  const xVal = data && data[0].formattedX

  const [{ tooltip }] = useAtom(themeState)

  return data ? (
    <TooltipContainer>
      <div
        style={{
          marginTop: 2,
          marginBottom: data.length === 1 ? 2 : 6,
          fontSize: tooltip?.xLabel?.fontSize || tooltip?.font?.size,
          color: '#555',
        }}
      >
        {xVal}
      </div>
      {data.map((d, i) => {
        const formattedGroup = formatMissing(d.group)
        return (
          <div
            key={`group-tooltip-${
              d.label || d.group !== '__group' ? formattedGroup : i
            }`}
          >
            <div
              style={{
                marginTop: 3,
                marginBottom: data.length < i + 1 ? 3 : 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {d.label || d.group !== '__group' ? (
                <>
                  {d.mark}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      marginLeft: 4,
                    }}
                  >
                    <div style={{ marginRight: 5 }}>
                      <span
                        style={{
                          fontSize:
                            tooltip?.groupLabel?.fontSize ||
                            tooltip?.font?.size,
                        }}
                      >
                        {d.label || formattedGroup}{' '}
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize:
                          tooltip?.yLabel?.fontSize ||
                          (tooltip?.font?.size || 12) + 1,
                      }}
                    >
                      {d.formattedY}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    fontWeight: 500,
                    fontSize:
                      tooltip?.yLabel?.fontSize ||
                      (tooltip?.font?.size || 12) + 1,
                  }}
                >
                  {d.formattedY}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </TooltipContainer>
  ) : null
}
