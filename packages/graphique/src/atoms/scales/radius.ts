import { atom } from "jotai"
import { SizeEncodingProps } from "./types"

export const radiusScaleState = atom<SizeEncodingProps>({
  range: [3, 30],
  domain: [undefined, undefined],
})
