import {
  scaleLinear,
  ScaleLinear,
  scaleLog,
  scaleTime,
  scaleUtc,
  scaleBand,
  scaleSqrt,
  ScaleBand,
  ScaleLogarithmic,
  ScalePower,
  ScaleTime,
  scaleOrdinal,
  scaleDiverging,
  scaleSequential,
  scaleQuantile,
  scaleQuantize,
  scaleThreshold,
  scalePow,
  ScaleOrdinal,
  ScaleDiverging,
  ScaleSequential,
  ScaleQuantile,
  ScaleQuantize,
  ScaleThreshold,
} from "d3-scale"

export type XYScale =
  | typeof scaleLinear
  | typeof scaleLog
  | typeof scaleSqrt
  | typeof scalePow
  | typeof scaleTime
  | typeof scaleUtc
  | typeof scaleBand

export type XYScaleTypes = ScaleLinear<any, any> &
  ScaleLogarithmic<any, any> &
  ScalePower<any, any> &
  ScaleTime<any, any> &
  ScaleBand<any>

export type VisualEncoding =
  // categorical
  | typeof scaleOrdinal
  | typeof scaleDiverging
  | typeof scaleSequential
  | typeof scaleQuantile
  | typeof scaleQuantize
  | typeof scaleThreshold
  // continuous
  | typeof scaleLinear
  | typeof scaleSqrt

export type VisualEncodingTypes =
  // categorical
  ScaleOrdinal<any, any> &
    ScaleLinear<any, any> &
    ScaleDiverging<any> &
    ScaleSequential<any> &
    ScaleQuantile<any> &
    ScaleQuantize<any> &
    ScaleThreshold<any, any> &
    // continuous
    ScaleLinear<any, any> &
    ScalePower<any, any>
