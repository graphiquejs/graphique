import {
  scaleLinear,
  scaleTime,
  scaleBand,
  scaleOrdinal,
  scaleSequential,
} from 'd3-scale'
import { extent } from 'd3-array'
import { GGProps } from '../gg/types/GG'
import { XYScaleProps, VisualEncodingProps } from '../atoms/scales/types'
import { XYScaleTypes, VisualEncodingTypes } from '../gg/types/Scales'
import { isDate } from './dates'
import {
  defaultScheme,
  defaultInterpolator,
  defaultDasharrays,
} from './scaleDefaults'

export interface IScale {
  xScale: XYScaleTypes
  yScale: XYScaleTypes
  fillScale?: VisualEncodingTypes
  strokeScale?: VisualEncodingTypes
  strokeDasharrayScale?: VisualEncodingTypes
  groupAccessor: (d: unknown) => string | number | Date | null
  groups?: string[]
}

export interface AutoScale extends GGProps {
  scalesState: {
    x: XYScaleProps
    y: XYScaleProps
    hasZeroXBaseLine: boolean
    hasZeroYBaseLine: boolean
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
  } = scalesState
  const { domain: xScaleDomain, type: xScaleType } = xScaleState || {}
  const { domain: yScaleDomain, type: yScaleType } = yScaleState || {}
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

  // identify groups
  const group =
    aes.group ||
    aes.fill ||
    aes.stroke ||
    aes.strokeDasharray ||
    (() => '__group')

  let hasCategoricalVar = aes.group !== undefined || false
  const calculatedGroups = group
    ? (Array.from(new Set(data.map(group))) as string[])
    : // .sort()
      // .map(g => (g === null ? "[null]" : g))
      // .sort()
      ['__group']

  let xScale
  const firstX = data.map(aes.x).find((d) => d !== null && d !== undefined)
  if (isDate(firstX)) {
    const domain =
      (xScaleDomain as Date[]) || extent(data, aes.x as (d: unknown) => Date)

    const hasDomain =
      typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

    xScale = scaleTime()
      .range([margin.left, width - margin.right])
      .domain(hasDomain ? domain : [0, 1])
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

  let yScale
  if (aes.y) {
    const firstY = data.map(aes.y).find((d) => d !== null && d !== undefined)

    if (isDate(firstY)) {
      const domain =
        (yScaleDomain as Date[]) || extent(data, aes.y as (d: unknown) => Date)

      const hasDomain =
        typeof domain[0] !== 'undefined' && typeof domain[1] !== 'undefined'

      yScale = scaleTime()
        .range([height - margin.bottom, margin.top])
        .domain(hasDomain ? domain : [0, 1])
    } else if (typeof firstY === 'number') {
      const defaultDomain = extent(data, aes.y as (d: unknown) => number)

      const domain = (yScaleDomain as number[]) || [
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
        new Set(copiedData.map(aes.y))
      ) as string[]
      const computedDomain = Array.from(new Set(data.map(aes.y))) as string[]

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

  // fill
  let fillScale
  if (aes.fill) {
    const firstFill = data
      .map(aes.fill)
      .find((d) => d !== null && d !== undefined)

    if (fillScaleType) {
      let domain
      const fillType = fillScaleType as any
      switch (fillScaleType.name) {
        case 'sequential':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, aes.fill as (d: unknown) => number) as number[])

          fillScale = fillType()
            .domain(domain)
            .interpolator(
              (fillScaleColors as (t: number) => string) || defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialLog':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, aes.fill as (d: unknown) => number) as number[])

          fillScale = fillType()
            .domain(domain)
            .interpolator(
              (fillScaleColors as (t: number) => string) || defaultInterpolator
            ) as VisualEncodingTypes
          break
        case 'sequentialSqrt':
          domain =
            (fillScaleDomain as number[]) ||
            (extent(data, aes.fill as (d: unknown) => number) as number[])

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
        (extent(data, aes.fill as (d: unknown) => number) as number[])

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
  if (aes.stroke) {
    const firstStroke = data
      .map(aes.stroke)
      .find((d) => d !== null && d !== undefined)

    if (strokeScaleType) {
      let domain
      const strokeType = strokeScaleType as any
      switch (strokeScaleType.name) {
        case 'sequential':
          domain =
            (strokeScaleDomain as number[]) ||
            (extent(data, aes.stroke as (d: unknown) => number) as number[])

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
            (extent(data, aes.stroke as (d: unknown) => number) as number[])

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
            (extent(data, aes.stroke as (d: unknown) => number) as number[])

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
        (extent(data, aes.stroke as (d: unknown) => number) as number[])

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
    // groupAccessor: (v: any) => (group(v) === null ? "[null]" : group(v)),
    groupAccessor: (v: any) => group(v),
    groups: hasCategoricalVar ? calculatedGroups : undefined,
  }
}
