import React, {
  useMemo,
  useRef,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"
import { useAtom } from "jotai"
import flattenChildren from "react-flatten-children"
import { Aes, GGProps } from "./types"
import { autoScale, IScale } from "../util/autoScale"
import { XAxis, YAxis } from "./axes"
import {
  themeState,
  labelsState,
  xScaleState,
  yScaleState,
  fillScaleState,
  strokeScaleState,
  strokeDasharrayState,
} from "../atoms"

export interface ContextProps {
  ggState: {
    id?: string
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
    data: unknown[]
    copiedData: unknown[]
    aes: Aes
    copiedScales: IScale
    scales: IScale
  }
  updateData: (newData: unknown[]) => void
}

const GGglobalCtx = createContext<ContextProps | undefined>(undefined)

export const GGBase = ({
  data,
  aes,
  width = 500,
  height = 450,
  margin: suppliedMargin,
  id,
  children,
}: GGProps) => {
  const [labels] = useAtom(labelsState)
  const [{ font, titleColor, axis, axisX, axisY }] = useAtom(themeState)
  const [xScale] = useAtom(xScaleState)
  const [yScale] = useAtom(yScaleState)
  const [fillScale] = useAtom(fillScaleState)
  const [strokeScale] = useAtom(strokeScaleState)
  const [strokeDasharrayScale] = useAtom(strokeDasharrayState)

  const [ggData, setGGData] = useState(data)

  const margin = {
    top: 10,
    right: 20,
    bottom: 40,
    left: 30,
    ...suppliedMargin,
  }

  const ggWidth = Math.min(window.innerWidth - 15, width)
  const copiedData = data

  const geoms: React.ReactNode[] = []
  const otherChildren: React.ReactNode[] = []

  flattenChildren(children).forEach(child => {
    if (React.isValidElement(child)) {
      const thisChild: any = child.type
      if (thisChild?.displayName?.includes("Geom")) {
        geoms.push(child)
      } else {
        otherChildren.push(child)
      }
    }
  })

  const barGeoms: any = geoms.find((g: any) =>
    g.type.displayName.includes("Bar")
  )
  const colGeoms: any = geoms.find((g: any) =>
    g.type.displayName.includes("Col")
  ) as any
  const hasZeroXBaseLine = barGeoms && !barGeoms?.props?.freeBaseLine
  const hasZeroYBaseLine = colGeoms && !colGeoms?.props?.freeBaseLine

  const ggState = useMemo(() => ({
      id,
      copiedData,
      data: ggData,
      aes,
      width: ggWidth,
      height,
      margin,
      copiedScales: autoScale({
        scalesState: {
          x: xScale,
          y: yScale,
          hasZeroXBaseLine,
          hasZeroYBaseLine,
          fill: fillScale,
          stroke: strokeScale,
          strokeDasharray: strokeDasharrayScale,
        },
        data,
        copiedData,
        aes,
        width: ggWidth,
        height,
        margin,
      }),
      scales: autoScale({
        scalesState: {
          x: xScale,
          y: yScale,
          hasZeroXBaseLine,
          hasZeroYBaseLine,
          fill: fillScale,
          stroke: strokeScale,
          strokeDasharray: strokeDasharrayScale,
        },
        data: ggData,
        copiedData,
        aes,
        width: ggWidth,
        height,
        margin,
      }),
    }), [
    id,
    data,
    ggData,
    copiedData,
    aes,
    ggWidth,
    height,
    margin,
    xScale,
    yScale,
    fillScale,
    strokeScale,
    strokeDasharrayScale,
    hasZeroXBaseLine,
    hasZeroYBaseLine,
  ])

  const updateData = (newData: typeof data) => {
    setGGData(newData)
  }

  useEffect(() => {
    setGGData(data)
  }, [data])

  const ggRef = useRef<SVGSVGElement>(null)

  return ggState ? (
    <GGglobalCtx.Provider value={{ ggState, updateData }}>
      <div id={`__gg_${id}`} style={{ position: "relative" }}>
        <div
          style={{
            marginBottom: 4,
            color: titleColor,
            fontFamily: font?.family,
          }}
        >
          {labels.title}
        </div>
        <div
          style={{
            position: "relative",
            top: margin.top,
            marginLeft: 8,
            marginBottom: 2,
            fontSize: 12,
            fontFamily: font?.family,
            lineHeight: 1.2,
            color: axis?.labelColor || axisY?.labelColor,
            minHeight: 20,
            fontWeight: 600,
          }}
        >
          {labels?.y}
        </div>
        <svg ref={ggRef} width={ggWidth} height={height}>
          {axisX && <XAxis ggState={ggState} />}
          {axisY && <YAxis ggState={ggState} />}
          {geoms}
        </svg>
        {/* tooltip portals */}
        <div style={{ position: "relative" }}>
          <div id={`__gg-tooltip-x-${id}`} />
          <div id={`__gg-tooltip-y-${id}`} />
        </div>
        {/* other types of children */}
        <div
          style={
            {
              // position: "absolute",
              // bottom: 0,
              // width: "100%",
              // height,
              // pointerEvents: "none",
            }
          }
        >
          {otherChildren}
        </div>
      </div>
    </GGglobalCtx.Provider>
  ) : null
}

export const useGG = () => useContext(GGglobalCtx)
