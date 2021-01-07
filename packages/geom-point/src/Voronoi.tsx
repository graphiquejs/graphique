import React, { useMemo } from "react"
import { useRecoilValue } from "recoil"
import {
  layoutState,
  aesState
} from "@graphique/gg"
import { voronoi, VoronoiPolygon } from "@visx/voronoi"

type Props = {
  data: unknown[]
  x: (d: any) => number
  y: (d: any) => number
  onMouseOver?: (d: any) => void
  onClick?: (d: any) => void
  onMouseLeave?: () => void
}

export const Voronoi: React.FC<Props> = ({
  data,
  x,
  y,
  onMouseOver,
  onMouseLeave,
  onClick
}) => {
  const aes = useRecoilValue(aesState)
  const { width, height, margin } = useRecoilValue(layoutState)

  const voronoiLayout = useMemo(() => {
    return voronoi({
      x: (d) => x(aes.x(d)),
      y: (d) => y(aes.y(d)),
      width: width,
      height: height,
    }).extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom - margin.top],
    ])
  }, [aes, width, height, x, y, margin])

  const voronoiDiagram = voronoiLayout(data)
  const polygons = voronoiDiagram.polygons()

  return (
    <g onMouseLeave={onMouseLeave ? _ => onMouseLeave() : undefined}>
      {polygons.map((p, i) => {
        return (
          <VoronoiPolygon
            key={`voronoi-polygon-${i}`}
            polygon={p}
            fill="transparent"
            // // stroke="#ddd"
            style={{ cursor: onClick ? "pointer" : "default" }}
            onMouseOver={
              onMouseOver ? (_) => {
                onMouseOver({ d: p.data, i })
               } : undefined
            }
            onClick={onClick ? _ => onClick({d: p.data, i}) : undefined}
          />
        )
      })}
      {/* <EventField xScale={x} yScale={y} /> */}
    </g>
  )
  
}