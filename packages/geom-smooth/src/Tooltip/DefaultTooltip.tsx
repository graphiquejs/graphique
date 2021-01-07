import React from "react"
import { TooltipContent, TooltipContainer } from "@graphique/gg"

type Props = {
  data: TooltipContent[]
  hasXAxisTooltip?: boolean
}

export const DefaultTooltip: React.FC<Props> = ({ data, hasXAxisTooltip=false }) => {

  const xVal = data[0].formattedX

  return (
    data && (
      <TooltipContainer>
        {!hasXAxisTooltip &&
          <div style={{ marginTop: 2, marginBottom: data.length === 1 ? 2 : 6, color: "#555" }}>
            {xVal}
          </div>
        }
        {data.map((d: TooltipContent, i: number) => {
          return (
            <div key={`group-tooltip-${d.label || d.group}`}>
              <div
                style={{
                  marginTop: 3,
                  marginBottom: data.length < (i + 1) ? 3 : 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {(d.label || d.group !== "__group") && (
                  <>
                    {d.mark}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        marginLeft: 4,
                      }}
                    >
                      <div style={{ marginRight: 5 }}>
                        <span>{d.label || d.group} </span>
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
    )
  )
}
