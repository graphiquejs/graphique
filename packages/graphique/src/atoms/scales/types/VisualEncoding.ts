import { VisualEncoding } from "../../../gg/types/Scales"

export interface VisualEncodingProps {
  type?: VisualEncoding
  domain?: any[]
  values?: readonly string[] | ((t: number) => string) | unknown[]
  reverse?: boolean
}

export interface SizeEncodingProps {
  domain?: [number, number] | [undefined, undefined]
  range?: [number, number] | [undefined, undefined]
}
