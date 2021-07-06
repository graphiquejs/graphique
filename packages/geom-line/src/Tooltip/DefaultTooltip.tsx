import React from 'react'
import {
  TooltipContent,
  TooltipContainer,
  formatMissing,
} from '@graphique/graphique'

export interface DefaultTooltipProps {
  data: TooltipContent[]
  hasXAxisTooltip?: boolean
}

export const DefaultTooltip = ({
  data,
  hasXAxisTooltip,
}: DefaultTooltipProps) => {
  const xVal = data && data[0].formattedX

  return data ? (
    <TooltipContainer>
      {!hasXAxisTooltip && (
        <div
          style={{
            marginTop: 2,
            marginBottom: data.length === 1 ? 2 : 6,
            color: '#555',
          }}
        >
          {xVal}
        </div>
      )}
      {data.map((d: TooltipContent, i: number) => {
        const formattedGroup = formatMissing(d.group)
        return (
          <div key={`group-tooltip-${d.label || formattedGroup}`}>
            <div
              style={{
                marginTop: 3,
                marginBottom: data.length < i + 1 ? 3 : 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {(d.label || d.group !== '__group') && (
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
                      <span>{d.label || formattedGroup} </span>
                    </div>
                  </div>
                </>
              )}
              <div style={{ fontWeight: 500, fontSize: 13 }}>
                {d.formattedY}
              </div>
            </div>
          </div>
        )
      })}
    </TooltipContainer>
  ) : null
}
