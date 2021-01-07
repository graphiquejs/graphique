import React from "react"
import { atom } from "recoil"
import { Aes } from "../ggBase"
import { LabelsProps } from "../labels"
import { ThemeProps } from "../theme"
import { isDate, formatDate, defaultCategoricalScheme } from "@graphique/util"

export const dataState = atom({
  key: "dataState",
  default: []
})

export const aesState = atom({
  key: "aesState",
  default: {
    label: d => d._id
  } as Aes
})

export const labelsState = atom({
  key: "labelsState",
  default: {
    title: "",
    x: "",
    y: ""
  } as LabelsProps
})

export const scalesState = atom({
  key: "scalesState",
  default: {
    scheme: defaultCategoricalScheme
  } as any
})

export type TooltipContent = {
  label?: string
  group?: string
  mark?: JSX.Element
  x: any
  y: any
  formattedX?: string
  formattedY?: string
  datum?: unknown
}

export type TooltipState = {
  x0?: any
  y0?: any
  datum?: unknown
  position?: "top" | "data"
  keepInParent?: boolean
  xFormat?: (d: any) => string
  yFormat?: (d: any) => string
  content?: (
    {data}: {data: {
      label?: string
      group?: string
      mark?: JSX.Element
      x: any
      y: any
      formattedY?: string
      datum?: unknown
    }[]}
  ) => React.ReactNode | undefined
  xAxis?: (({ x }: { x: any }) => JSX.Element) | boolean
}

export const tooltipState = atom({
  key: "tooltipState",
  default: {
    position: "data",
    keepInParent: true,
    xFormat: (x) =>
      isDate(x)
        ? formatDate(x)
        : typeof x === "number"
        ? x.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : x.toString(),
    yFormat: (y) =>
      isDate(y)
        ? formatDate(y)
        : typeof y === "number"
        ? y.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : y.toString(),
    xAxis: false,
  } as TooltipState,
})

type LayoutState = {
  parentWidth: number
  width: number
  height: number
  margin: { top: number, right: number, bottom: number, left: number }
  id: string
}

export const layoutState = atom({
  key: "layoutState",
  default: {
    parentWidth: 0,
    width: 550,
    height: 300,
    margin: {
      top: 8,
      right: 20,
      bottom: 35,
      left: 50
    }
  } as LayoutState
})

export const themeState = atom({
  key: "themeState",
  default: {
    titleColor: "#222",
    markerStroke: "#fff",
    defaultStroke: "cornflowerblue",
    defaultFill: "#777777ee",
    font: {
      family: `-apple-system, BlinkMacSystemFont, Segoe UI,
               Roboto, Oxygen-Sans, Ubuntu, Cantarell,
               Helvetica Neue, sans-serif`
      },
    grid: {
      stroke: "#55555513"
    },
    axis: {
      labelColor: "#666",
      stroke: "#55555533",
      tickLabelColor: "#888",
      tickStroke: "#55555513",
      hideAxisLines: true
    },
    axisX: {
      labelColor: "#666",
      stroke: "#55555533",
      tickLabelColor: "#888",
      tickStroke: "#55555513",
      hideAxisLine: true
    },
    axisY: {
      labelColor: "#666",
      stroke: "#55555533",
      tickLabelColor: "#888",
      tickStroke: "#55555513",
      hideAxisLine: true
    }
  } as ThemeProps
})