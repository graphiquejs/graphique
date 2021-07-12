import React from 'react'
import {
  TooltipContent,
  TooltipContainer,
  formatMissing,
} from '@graphique/graphique'

interface Props {
  data: TooltipContent[]
}

export const DefaultTooltip = ({ data }: Props) => {
  const yVal = data && data[0].formattedY
  // const [{ x: xLab, y: yLab }] = useAtom(labelsState)

  return data ? (
    <TooltipContainer>
      <div
        style={{
          marginTop: 2,
          marginBottom: data.length === 1 ? 2 : 6,
          color: '#555',
        }}
      >
        {yVal}
      </div>
      {data.map((d: TooltipContent, i: number) => {
        const formattedGroup = formatMissing(d.group)
        return (
          <div
            key={`group-tooltip-${
              d.label || d.group !== '__group' ? formattedGroup : i
            }`}
          >
            <div
              style={{
                marginTop: 4,
                marginBottom: 4,
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
                      <span>{d.label || formattedGroup} </span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {d.formattedX}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ fontWeight: 500, fontSize: 13 }}>
                  {d.formattedX}
                </div>
              )}
              {/* <div style={{ display: "flex" }}>
                {yLab && <div>{`${yLab}:`}</div>}
                <div style={{ marginLeft: 1, fontWeight: 500, fontSize: 13 }}>
                  {d.formattedY}
                </div>
              </div>
              <div style={{ display: "flex", marginBottom: 2 }}>
                {xLab && <div>{`${xLab}:`}</div>}
                <div style={{ marginLeft: 1, fontWeight: 500, fontSize: 13 }}>
                  {d.formattedX}
                </div>
              </div> */}
            </div>
          </div>
        )
      })}
    </TooltipContainer>
  ) : null
}
