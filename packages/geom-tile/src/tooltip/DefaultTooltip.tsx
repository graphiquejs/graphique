import React from 'react'
import {
  TooltipContent,
  TooltipContainer,
  formatMissing,
  labelsState,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

interface Props {
  data: TooltipContent[]
}

export const DefaultTooltip = ({ data }: Props) => {
  const [{ x: xLab, y: yLab }] = useAtom(labelsState)

  return data ? (
    <TooltipContainer>
      {data.map((d: TooltipContent) => {
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
                      <span>{d.formattedMeasure || formattedGroup}</span>
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', marginBottom: 2 }}>
                {xLab && <div>{`${xLab}:`}</div>}
                <div style={{ marginLeft: 1, fontWeight: 500, fontSize: 13 }}>
                  {d.formattedX}
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                {yLab && <div>{`${yLab}:`}</div>}
                <div style={{ marginLeft: 1, fontWeight: 500, fontSize: 13 }}>
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
