import { timeParse, timeFormat } from "d3-time-format"

export const parseDate = (dateString: string, specifier = "%Y-%m-%d") => {
  return timeParse(specifier)(dateString)
}

export const isDate = (date: any) =>
  Object.prototype.toString.call(date) === "[object Date]"

export const formatMonth = (v: Date, monthOnly = false): string => {
  return monthOnly
    ? v.getMonth() === 0
      ? timeFormat("%b %Y")(v)
      : timeFormat("%b")(v)
    : timeFormat("%b %Y")(v)
}

export const formatDate = (v: Date, format="%b %d, %Y"): string => {
  return timeFormat(format)(v)
}