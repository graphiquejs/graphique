import { atom } from "jotai"
import { XYScaleProps } from "./types"

export const yScaleState = atom<XYScaleProps>({
  numTicks: height => (height && height < 500 ? 4 : undefined),
})
