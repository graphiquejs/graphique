type DataValue = (
  d: any
) =>
  | number
  | Date
  | null
  | ({ valueOf(): number } & string)
  | (Date & { valueOf(): number } & string)
  | ({ toString(): string } & string)

export interface Aes {
  /** a functional mapping to `data` used to create an **x** scale */
  x: DataValue
  /** a functional mapping to `data` used to create a **y** scale */
  y?: DataValue
  /** a functional mapping to `data` used to create a **stroke** scale */
  stroke?: DataValue
  /** a functional mapping to `data` used to create a **strokeDasharray** scale */
  strokeDasharray?: DataValue
  /** a functional mapping to `data` used to create a
   * continuous **size** scale
   *
   * Right now it's only used with `<GeomPoint>` to create a radius scale for points.
   */
  size?: (d: any) => number | null | undefined
  /** a functional mapping to `data` used to create a **fill** scale */
  fill?: DataValue
  /** a functional mapping to `data` used to create
   * distinct groups explicitly (without an associated scale) */
  group?: DataValue
  /** a functional mapping to `data` used to label tooltips */
  label?: (d: any) => string | null | undefined
  /** a functional mapping to `data` used to distinguish
   * individual data points
   *
   * (useful for `<GeomPoint>`)
   * */
  key?: (d: any) => string | number
}
