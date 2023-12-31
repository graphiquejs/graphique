export type DataValue<Datum> = (
  d: Datum
) =>
  | number
  | Date
  | null
  | ({ valueOf(): number } & string)
  | (Date & { valueOf(): number } & string)
  | ({ toString(): string } & string)

export interface Aes<Datum> {
  /** a functional mapping to `data` used to create an **x** scale */
  x: DataValue<Datum>
  /** a functional mapping to `data` used to create a **y** scale */
  y?: DataValue<Datum>
  /** a functional mapping to `data` used to create a **stroke** scale */
  stroke?: DataValue<Datum>
  /** a functional mapping to `data` used to create a **strokeDasharray** scale */
  strokeDasharray?: DataValue<Datum>
  /** a functional mapping to `data` used to create a
   * continuous **size** scale
   *
   * Right now it's only used with `<GeomPoint>` to create a radius scale for points.
   */
  size?: (d: Datum) => number | null | undefined
  /** a functional mapping to `data` used to create a **fill** scale */
  fill?: DataValue<Datum>
  /** a functional mapping to `data` used to create
   * distinct groups explicitly (without an associated scale) */
  group?: DataValue<Datum>
  /** a functional mapping to `data` used to label tooltips */
  label?: (d?: Datum) => string
  /** a functional mapping to `data` used to distinguish
   * individual data points
   *
   * (useful for `<GeomPoint>`)
   * */
  key?: (d?: Datum) => string
}
