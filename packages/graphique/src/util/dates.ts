import { timeParse, timeFormat } from 'd3-time-format'

export const parseDate = (dateString: string, specifier = '%Y-%m-%d') =>
  timeParse(specifier)(dateString)

export const isDate = (date: any) =>
  Object.prototype.toString.call(date) === '[object Date]'

export const formatMonth = (v: Date, monthOnly = false): string => {
  let monthFormat
  if (monthOnly) {
    monthFormat =
      v.getMonth() === 0 ? timeFormat('%b %Y')(v) : timeFormat('%b')(v)
  } else {
    monthFormat = timeFormat('%b %Y')(v)
  }
  return monthFormat
}

export const formatDate = (v: Date, format = '%b %d, %Y'): string =>
  timeFormat(format)(v)
