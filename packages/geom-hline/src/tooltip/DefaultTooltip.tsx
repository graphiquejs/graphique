import React from 'react'
import { useAtom } from 'jotai'
import {
  labelsState,
  TooltipContent,
  TooltipContainer,
  themeState,
} from '@graphique/graphique'

interface Props {
  data: TooltipContent[]
}

export const DefaultTooltip = ({ data }: Props) => {
  const [{ y: yLab }] = useAtom(labelsState)
  const [{ tooltip }] = useAtom(themeState)

  return data ? (
    <TooltipContainer>
      {data.map((d: TooltipContent) => (
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
            <div style={{ display: 'flex', marginBottom: 2 }}>
              {d.label ? (
                <div
                  style={{
                    fontSize:
                      tooltip?.groupLabel?.fontSize || tooltip?.font?.size,
                  }}
                >
                  {`${d.label}:`}
                </div>
              ) : (
                yLab && (
                  <div
                    style={{
                      fontSize:
                        tooltip?.groupLabel?.fontSize || tooltip?.font?.size,
                    }}
                  >
                    {`${yLab}:`}
                  </div>
                )
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
      ))}
    </TooltipContainer>
  ) : null
}
