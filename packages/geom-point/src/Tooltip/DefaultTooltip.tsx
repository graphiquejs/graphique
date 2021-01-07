import React from "react"
import { useRecoilValue } from "recoil"
import { TooltipContent, TooltipContainer, labelsState, aesState } from "@graphique/gg"

type Props = {
  data: TooltipContent[]
}

export const DefaultTooltip: React.FC<Props> = ({ data }) => {

  const { x: xLab, y: yLab } = useRecoilValue(labelsState)
  const { x: xAes, y: yAes } = useRecoilValue(aesState)

  return (
    data && (
      <TooltipContainer>
        {data.map((d: TooltipContent) => {
          return (
            <div key={`group-tooltip-${d.label || d.group}`}>
              <div
                style={{
                  marginTop: 4,
                  marginBottom: 4,
                }}
              >
                {(d.label || d.group !== "__group") && (
                  <>
                    {d.mark}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        fontWeight: 500
                      }}
                    >
                      <div style={{ marginBottom: 4}}>
                        <span>{d.label || d.group} </span>
                      </div>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", marginBottom: 2 }}>
                  <div>{xLab || xAes.toString()}:</div>
                  <div style={{ marginLeft: 2, fontWeight: 500, fontSize: 13 }}>
                    {d.formattedX}
                  </div>
                </div>
                <div style={{display: "flex"}}>
                  <div>{yLab || yAes.toString()}:</div>
                  <div style={{ marginLeft: 2, fontWeight: 500, fontSize: 13 }}>
                    {d.formattedY}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </TooltipContainer>
    )
  )
}
