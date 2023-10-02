import {
  scaleLinear,
  scaleTime,
  scaleBand,
  scaleOrdinal,
  scaleSequential,
} from 'd3-scale'
import { extent } from 'd3-array'
import type { XYScaleProps, VisualEncodingProps } from '../atoms/scales/types'
import type { DataValue, XYScaleTypes, VisualEncodingTypes, GGProps } from '../gg'
import {
  defaultScheme,
  defaultInterpolator,
  defaultDasharrays,
} from './scaleDefaults'
import { defineGroupAccessor } from './defineGroupAccessor'
import { isDate } from './dates'

export interface IScale {
  xScale: XYScaleTypes
  yScale: XYScaleTypes
  fillScale?: VisualEncodingTypes
  strokeScale?: VisualEncodingTypes
  strokeDasharrayScale?: VisualEncodingTypes
  groupAccessor: DataValue | undefined
  groups?: string[]
}

export interface AutoScale extends GGProps {
  scalesState: {
    x: XYScaleProps
    y: XYScaleProps
    hasZeroXBaseLine: boolean
    hasZeroYBaseLine: boolean
    geomGroupAccessors: DataValue[]
    y0Aes?: DataValue
    y1Aes?: DataValue
    geomAesYs: DataValue[]
    geomAesStrokes: DataValue[]
    geomAesFills: DataValue[]
    fill?: VisualEncodingProps
    stroke?: VisualEncodingProps
    strokeDasharray?: VisualEncodingProps
  }
  copiedData: unknown[]
}

export const autoScale = ({
  scalesState,
  data,
  copiedData,
  aes,
  width = 500,
  height = 450,
  margin: suppliedMargin,
}: AutoScale): IScale => {
  const margin = {
    top: 10,
    right: 20,
    bottom: 10,
    left: 30,
    ...suppliedMargin,
  }

  const {
    x: xScaleState,
    y: yScaleState,
    fill: fillScaleState,
    stroke: strokeScaleState,
    strokeDasharray: strokeDasharrayState,
    hasZeroXBaseLine,
    hasZeroYBaseLine,
    geomGroupAccessors,
    y0Aes,
    y1Aes,
    geomAesYs,
    geomAesStrokes,
    geomAesFills,
  } = scalesState
  const { domain: xScaleDomain, type: xScaleType, reverse: reverseX } = xScaleState || {}
  const { domain: yScaleDomain, type: yScaleType, reverse: reverseY } = yScaleState || {}
  const {
    domain: fillScaleDomain,
    type: fillScaleType,
    values: fillScaleColors,
    reverse: fillScaleReverse,
  } = fillScaleState || {}
  const {
    domain: strokeScaleDomain,
    type: strokeScaleType,
    values: strokeScaleColors,
    reverse: strokeScaleReverse,
  } = strokeScaleState || {}
  const { domain: strokeDasharrayDomain, values: strokeDasharrays } =
    strokeDasharrayState || {}

  // used for maintaining the member order (domain) in categorical axes
  const sortDomain = (a: string, b: string, initialDomain: string[]) =>
    initialDomain.indexOf(a) - initialDomain.indexOf(b)
  
  const geomGroupAccessor = geomGroupAccessors.length ? geomGroupAccessors[0] : undefined

  // identify groups
  const group = (
    aes?.group ||
    aes?.fill ||
    aes?.stroke ||
    aes?.strokeDasharray
  ) ? 
  defineGroupAccessor(aes) :
  geomGroupAccessor

  let hasCategoricalVar = aes.group || geomGroupAccessors.length || false
  const calculatedGroups = group
    ? (Array.from(new Set(data.map(group))) as string[])
    : // .sort()
      // .map(g => (g === null ? "[null]" : g))
      // .sort()
      ['__group']

  const thisYAes = aes.y || (geomAesYs.length ? geomAesYs[0] : undefined)
  const resolvedYAes = thisYAes ?? y1Aes ?? y0Aes
  const thisStrokeAes = aes.stroke || (geomAesStrokes.length ? geomAesStrokes[0] : undefined)
  const thisFillAes = aes.fill || (geomAesFills.length ? geomAesFills[0] : undefined)

  
  /// SCALING ///


  let xScale
  const firstX = data.map(aes.x).find((d) => d !== null && d !== undefined)
  if (isDate(firstX)) {
    const domain =
      (xScaleDomain as Date[]) || extent(data, aes.x as (d: unknown) => Date)

    const hasDomain =
      typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined' &&
      // check for only null Dates
      domain[0].valueOf() !== 0 && domain[1].valueOf() !== 0

    xScale = scaleTime()
      .range([margin.left, width - margin.right])
      .domain(hasDomain ? domain : [0, 0])
  } else if (typeof firstX === 'number') {
    const defaultDomain = extent(data, aes.x as (d: unknown) => number)

    const domain = (xScaleDomain as number[]) || [
      hasZeroXBaseLine ? 0 : defaultDomain[0],
      defaultDomain[1],
    ]

    const hasDomain =
      typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

    const xType: any = xScaleType || scaleLinear
    xScale = xType()
      .range([margin.left, width - margin.right])
      .domain(hasDomain ? domain : [0, 1])
  } else if (!firstX || typeof firstX === 'string') {
    // hasCategoricalVar = true
    // maintain the existing order
    const initialDomain = Array.from(new Set(copiedData.map(aes.x))) as string[]
    const computedDomain = Array.from(new Set(data.map(aes.x))) as string[]

    const domain =
      (xScaleDomain as string[]) ||
      computedDomain.sort((a, b) => sortDomain(a, b, initialDomain))

    xScale = scaleBand()
      .range([margin.left, width - margin.right])
      .domain(domain)
  }
  if (reverseX) xScale?.domain(xScale.domain().reverse())

  let yScale
  // else if (y0Aes && y1Aes) {

  //   const firstY = data.map(y1Aes).find((d) => d !== null && d !== undefined)

  //   if (isDate(firstY)) {
  //     const domain =
  //       (yScaleDomain as Date[]) || extent(data.map(d => [(y0Aes(d) as Date), (y1Aes(d) as Date)]).flat())

  //     const hasDomain =
  //       typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

  //     yScale = scaleTime()
  //       .range([height - margin.bottom, margin.top])
  //       .domain(hasDomain ? domain : [0, 1])
  //   } else if (typeof firstY === 'number') {
  //     const defaultDomain = extent(data.map(d => [(y0Aes(d) as number), (y1Aes(d) as number)]).flat())

  //     const domain = (yScaleDomain as number[]) || [
  //       hasZeroYBaseLine ? 0 : defaultDomain[0],
  //       defaultDomain[1],
  //     ]

  //     const hasDomain =
  //       typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

  //     const yType: any = yScaleType || scaleLinear

  //     yScale = yType()
  //       .range([height - margin.bottom, margin.top])
  //       .domain(hasDomain ? domain : [0, 1])
  //   } else {
  //     yScale = scaleLinear()
  //       .range([height - margin.bottom, margin.top])
  //       .domain([0, 0])
  //   }
    // else if (!firstY || typeof firstY === 'string') {
    //   // hasCategoricalVar = true
    //   // maintain the existing order
    //   const initialDomain = Array.from(
    //     new Set(copiedData.map(aes.y))
    //   ) as string[]
    //   const computedDomain = Array.from(new Set(data.map(aes.y))) as string[]

    //   const domain =
    //     (yScaleDomain as string[]) ||
    //     computedDomain.sort((a, b) => sortDomain(a, b, initialDomain))

    //   yScale = scaleBand()
    //     .range([margin.top, height - margin.bottom])
    //     .domain(domain)
    //   // .padding(0.2)
    // }
   if (resolvedYAes) {
    const firstY = data.map(resolvedYAes).find((d) => d !== null && d !== undefined)

    if (isDate(firstY)) {
      const domain =
        (yScaleDomain as Date[]) || extent(data, thisYAes as (d: unknown) => Date)

      const hasDomain =
        typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

      yScale = scaleTime()
        .range([height - margin.bottom, margin.top])
        .domain(hasDomain ? domain : [0, 1])
    } else if (typeof firstY === 'number') {
      const defaultDomain = extent(data, thisYAes as (d: unknown) => number)

      const domain = yScaleDomain ?? [
        hasZeroYBaseLine ? 0 : defaultDomain[0],
        defaultDomain[1],
      ]

      const hasDomain =
        typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

      const yType: any = yScaleType || scaleLinear

      yScale = yType()
        .range([height - margin.bottom, margin.top])
        .domain(hasDomain ? domain : [0, 1])
    } else if (!firstY || typeof firstY === 'string') {
      // hasCategoricalVar = true
      // maintain the existing order
      const initialDomain = Array.from(
        new Set(copiedData.map(resolvedYAes))
      ) as string[]
      const computedDomain = Array.from(new Set(data.map(resolvedYAes))) as string[]

      const domain =
        (yScaleDomain as string[]) ||
        computedDomain.sort((a, b) => sortDomain(a, b, initialDomain))

      yScale = scaleBand()
        .range([margin.top, height - margin.bottom])
        .domain(domain)
      // .padding(0.2)
    }
  } else {
    yScale = scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, 1])
  }
  if (reverseY) yScale?.domain(yScale.domain().reverse())

  // fill
  let fillScale
  if (thisFillAes) {
    const firstFill = data
      .map(thisFillAes)
      .find((d) => d !== null && d !== undefined)

    if (fillScaleType) {
      let domain
      const fillType = fillScaleType as any
      switch (fillScaleType.name) {
        case 'sequential':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, thisFillAes as (d: unknown) => number) as number[])

          fillScale = fillType()
            .domain(domain)
            .interpolator(
              (fillScaleColors as (t: number) => string) || defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialLog':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, thisFillAes as (d: unknown) => number) as number[])

          fillScale = fillType()
            .domain(domain)
            .interpolator(
              (fillScaleColors as (t: number) => string) || defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialSqrt':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, thisFillAes as (d: unknown) => number) as number[])

          fillScale = fillType()
            .domain(domain)
            .interpolator(
              (fillScaleColors as (t: number) => string) || defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'ordinal':
          hasCategoricalVar = true
          domain = (fillScaleDomain as string[]) || calculatedGroups

          fillScale = fillType()
            .domain(domain)
            .range(
              (fillScaleColors as string[]) || defaultScheme
            ) as VisualEncodingTypes
          break
        default:
          hasCategoricalVar = true
          domain = (fillScaleDomain as string[]) || calculatedGroups

          fillScale = fillType()
            .domain(domain)
            .range(
              (fillScaleColors as string[]) || defaultScheme
            ) as VisualEncodingTypes
      }
    } else if (!firstFill || typeof firstFill === 'string') {
      hasCategoricalVar = true
      const domain = (fillScaleDomain as string[]) || calculatedGroups

      fillScale = scaleOrdinal()
        .domain(domain)
        .range(
          (fillScaleColors as string[]) || defaultScheme
        ) as VisualEncodingTypes
    } else if (isDate(firstFill) || typeof firstFill === 'number') {
      const domain =
        (fillScaleDomain as number[]) ||
        (extent(data, thisFillAes as (d: unknown) => number) as number[])

      fillScale = scaleSequential()
        .domain(domain)
        .interpolator(
          (fillScaleColors as (t: number) => string) || defaultInterpolator
        ) as VisualEncodingTypes
    }
  }
  if (fillScaleReverse) fillScale?.domain(fillScale.domain().reverse())

  // stroke
  let strokeScale
  if (thisStrokeAes) {
    const firstStroke = data
      .map(thisStrokeAes)
      .find((d) => d !== null && d !== undefined)

    if (strokeScaleType) {
      let domain
      const strokeType = strokeScaleType as any
      switch (strokeScaleType.name) {
        case 'sequential':
          domain =
            (strokeScaleDomain as number[]) ||
            (extent(data, thisStrokeAes as (d: unknown) => number) as number[])

          strokeScale = strokeType()
            .domain(domain)
            .interpolator(
              (strokeScaleColors as (t: number) => string) ||
                defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialLog':
          domain =
            (strokeScaleDomain as number[]) ||
            (extent(data, thisStrokeAes as (d: unknown) => number) as number[])

          strokeScale = strokeType()
            .domain(domain)
            .interpolator(
              (strokeScaleColors as (t: number) => string) ||
                defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialSqrt':
          domain =
            (strokeScaleDomain as number[]) ||
            (extent(data, thisStrokeAes as (d: unknown) => number) as number[])

          strokeScale = strokeType()
            .domain(domain)
            .interpolator(
              (strokeScaleColors as (t: number) => string) ||
                defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'ordinal':
          hasCategoricalVar = true
          domain = (strokeScaleDomain as string[]) || calculatedGroups

          strokeScale = strokeType()
            .domain(domain)
            .range(
              (strokeScaleColors as string[]) || defaultScheme
            ) as VisualEncodingTypes
          break
        default:
          hasCategoricalVar = true
          domain = (strokeScaleDomain as string[]) || calculatedGroups

          strokeScale = strokeType()
            .domain(domain)
            .range(
              (strokeScaleColors as string[]) || defaultScheme
            ) as VisualEncodingTypes
      }
    } else if (!firstStroke || typeof firstStroke === 'string') {
      hasCategoricalVar = true
      const domain = (strokeScaleDomain as string[]) || calculatedGroups

      strokeScale = scaleOrdinal()
        .domain(domain)
        .range(
          (strokeScaleColors as string[]) || defaultScheme
        ) as VisualEncodingTypes
    } else if (isDate(firstStroke) || typeof firstStroke === 'number') {
      const domain =
        (strokeScaleDomain as number[]) ||
        (extent(data, thisStrokeAes as (d: unknown) => number) as number[])

      strokeScale = scaleSequential()
        .domain(domain)
        .interpolator(
          (strokeScaleColors as (t: number) => string) || defaultInterpolator
        ) as VisualEncodingTypes
    }
  }
  if (strokeScaleReverse) strokeScale?.domain(strokeScale.domain().reverse())

  // stroke
  let strokeDasharrayScale
  if (aes.strokeDasharray) {
    hasCategoricalVar = true
    const domain = (strokeDasharrayDomain as string[]) || calculatedGroups

    strokeDasharrayScale = scaleOrdinal()
      .domain(domain)
      .range(
        (strokeDasharrays as string[]) || defaultDasharrays
      ) as VisualEncodingTypes
  }

  return {
    xScale,
    yScale,
    fillScale,
    strokeScale,
    strokeDasharrayScale,
    groupAccessor: group,
    groups: hasCategoricalVar ? calculatedGroups : undefined,
  }
}
