import React, { useCallback } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { tooltipState, layoutState } from "../atoms"
import { Bar } from "@visx/shape"
import { localPoint } from "@visx/event"

type Props = {
  xScale: any
  yScale: any
  onMouseOver?: ({ x0 }: any) => void
  onMouseOut?: () => void
}

const EventField: React.FC<Props> = ({
  xScale,
  yScale,
  onMouseOver,
  onMouseOut
}) => {

  const setTooltipState = useSetRecoilState(tooltipState)
  const { margin, width, height } = useRecoilValue(layoutState)

  // const [coordVals, setCoordVals] = useState({ x0: undefined, y0: undefined })
  const handleMouseOver = useCallback((event: any) => {
    // console.log(localPoint(event.target.ownerSVGElement))

    const pos = localPoint(event)
    const x0 = xScale.invert(pos?.x)
    const y0 = yScale.invert(pos?.y)

    setTooltipState((tooltip) => {
      return {
        ...tooltip,
        x0,
        y0,
      }
    })

    onMouseOver && onMouseOver({ x0, y0 })

    // const coords = localPoint(event.target.ownerSVGElement, event)
    // showTooltip({
    //   tooltipLeft: coords?.x,
    //   tooltipTop: coords?.y,
    //   tooltipData: datum,
    // })
  }, [setTooltipState, xScale, yScale, onMouseOver])

  const handleMouseOut = () => {
    setTooltipState((tooltip) => {
      return {
        ...tooltip,
        x0: undefined,
        y0: undefined,
      }
    })

    onMouseOut && onMouseOut()
  }

  return (
    <Bar
      x={margin.left}
      y={margin.top}
      width={width - margin.left - margin.right}
      height={height - margin.top - margin.bottom - 8}
      fill="transparent"
      onMouseMove={handleMouseOver}
      onMouseLeave={handleMouseOut}
      onTouchStart={handleMouseOver}
      onTouchMove={handleMouseOver}
      onTouchEnd={handleMouseOut}
    />
  )
}

EventField.displayName = "ScaleStroke"
export { EventField }