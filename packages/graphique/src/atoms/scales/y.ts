import { atom } from "jotai"
import { XYScaleProps } from "./types"

interface YScaleProps extends XYScaleProps {
  isFixed?: boolean
}

export const yScaleState = atom<YScaleProps>({
  numTicks: height => (height && height < 500 ? 4 : undefined),
})
