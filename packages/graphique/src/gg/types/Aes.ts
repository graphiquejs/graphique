export type DataValue<Datum> = (
  d: Datum,
) => number | string | Date | null | undefined

export interface Aes<Datum> {
  /** functional mapping to `data` used to create an **x** scale */
  x: DataValue<Datum>
  /** functional mapping to `data` used to create a **y** scale */
  y?: DataValue<Datum>
  /** functional mapping to `data` used to create a **stroke** scale */
  stroke?: DataValue<Datum>
  /** functional mapping to `data` used to create a **strokeDasharray** scale */
  strokeDasharray?: DataValue<Datum>
  /** functional mapping to `data` used to create a
   * continuous **size** scale
   *
   * Right now it's only used with `<GeomPoint>` to create a radius scale for points.
   */
  size?: (d: Datum) => number | null | undefined
  /** functional mapping to `data` used to create a **fill** scale */
  fill?: DataValue<Datum>
  /** functional mapping to `data` used to create
   * distinct groups explicitly (without an associated scale) */
  group?: DataValue<Datum>
  /** functional mapping to `data` used to label tooltips */
  label?: (d: Datum) => string
  /** functional mapping to `data` used to distinguish
   * individual data points
   *
   * (useful for `<GeomPoint>`)
   * */
  key?: (d: Datum) => string
}
