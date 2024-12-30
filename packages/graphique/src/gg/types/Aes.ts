export type DataValue<Datum> = (
  d: Datum,
) => number | string | Date | null | undefined

export interface Aes<Datum> {
  /** functional mapping to `data` used to create an [x scale](https://graphique.dev/docs/graphique/scales/x) */
  x: DataValue<Datum>
  /** functional mapping to `data` used to create a [y scale](https://graphique.dev/docs/graphique/scales/y) */
  y?: DataValue<Datum>
  /** functional mapping to `data` used to create a [stroke scale](https://graphique.dev/docs/graphique/scales/stroke) */
  stroke?: DataValue<Datum>
  /** functional mapping to `data` used to create a [strokeDasharray scale](https://graphique.dev/docs/graphique/scales/stroke-dasharray) */
  strokeDasharray?: DataValue<Datum>
  /** functional mapping to `data` used to create a
   * continuous **size** scale
   *
   * Right now it's only used with `<GeomPoint>` to create a [radius scale](https://graphique.dev/docs/graphique/scales/radius) for points.
   */
  size?: (d: Datum) => number | null | undefined
  /** functional mapping to `data` used to create a [fill scale](https://graphique.dev/docs/graphique/scales/fill) */
  fill?: DataValue<Datum>
  /** functional mapping to `data` used to create
   * distinct groups explicitly (without an associated scale) */
  group?: DataValue<Datum>
  /** functional mapping to `data` used to label tooltips and text values created with `GeomLabel` */
  label?: (d: Datum) => string
  /** functional mapping to `data` used to distinguish individual data points */
  key?: (d: Datum) => string
}
