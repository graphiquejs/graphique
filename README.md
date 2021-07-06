<div align="center">
  <a href="https://mattadams.io/graphique">
    <img src="./assets/graphique_logo_white_bg.png" width=300px />
  </a>
  <p>
  An interactive visualization system for React based on the Grammar of Graphics.
  </p>
</div>

<hr />

## Graphique

Graphique allows you to concisely create flexible and reusable interactive visualizations by:

- mapping variables in data to visual components or aesthetics (`aes`)
- composing or layering relatively simple graphical objects ([geometries](#geoms), [scales](#scales), etc.)
- using reasonable defaults that can be configured for flexibility

## Usage

#### Creating a simple, interactive line chart

Install only the geometries you need.

```shell
npm install @graphique/graphique @graphique/geom-line @visx/mock-data
```

or

```shell
yarn add @graphique/graphique @graphique/geom-line @visx/mock-data
```

```jsx
import React from "react"
import ReactDOM from "react-dom"
import { GG } from "@graphique/graphique"
import { GeomLine } from "@graphique/geom-line"
import { appleStock } from "@visx/mock-data"

// default basic line chart
const LineChart = () => {
  return (
    <GG
      data={appleStock.slice(400, 700)}
      aes={{
        x: (d) => new Date(d.date),
        y: (d) => d.close,
      }}
    >
      <GeomLine />
    </GG>
  )
}

ReactDOM.render(<LineChart />, document.getElementById("root"))
```

<div align="center">
  <img src="./assets/graphique_basic_line.png" width="600px"/>
</div>

## Responsive

To keep your Graphique visualization the width of its parent container, you only need to specify `useParentWidth` and you'll get an appropriately-scaled and responsive version.

```jsx
<GG
  data={appleStock.slice(400, 700)}
  aes={{
    x: (d) => new Date(d.date),
    y: (d) => d.close,
  }}
  useParentWidth
>
  <GeomLine />
</GG>
```

## Examples

Check out out the Storybook demos here: https://graphique.mattadams.io

## Design philosophy

Relative to existing tools and libraries for creating interactive data visualizations for React applications, Graphique exists "above" low-level APIs and "below" high-level/out-of-the-box/"named chart" charting libraries.

As much as possible, the "boring", but essential parts of visualizing data should be taken care of for you out-of-the-box. This means (by default) you shouldn't need to manually create your own scales, axes, coordinate systems, tooltips, interactive legends, animated transitions, or responsive logic. But when it comes time, you can customize/override nearly everything to suit your specific needs.

With sensible defaults, Graphique aims to be just opinionated enough to make the process of creating highly customizable visualizations as streamlined as possible. Graphique is (heavily) inspired by [ggplot2](https://ggplot2.tidyverse.org/), and under the hood it's built on [d3](https://d3js.org).

## A layered approach

```jsx
// empty / no geoms
// defaults provide:
// x/y scales, coordinate system,
// grid, axes, ticks, dimensions, theme
<GG
  data={appleStock.slice(400, 700)}
  aes={{
    x: (d) => new Date(d.date),
    y: (d) => d.close,
  }}
/>
```

<h3 id='geoms'><code>Geom</code>*</h3>

The shapes to be drawn.

- `GeomLine`: line charts and other kinds of lines
- `GeomPoint`: scatterplots, dotplots, and bubble charts
- `GeomTile`: rectangular charts like heatmaps
- `GeomBar`: bar charts (horizontal bars)
- `GeomCol`: column charts (vertical bars)
- `GeomHist`: histograms
- `GeomSmooth`: local smoothing and regression with standard error bands
- TODO: `GeomLabel`, `GeomHLine`, `GeomVLine`, `GeomArea`, `GeomDensity`, and more on the way!

<h3 id='scales'><code>Scale</code>*</h3>

For specifying how data characteristics relate to visual characteristics.

- `ScaleX` / `ScaleY`
- `ScaleFill`
- `ScaleSize`
- `ScaleStroke`
- `ScaleDashArray`

<h3 id='labels'><code>Labels</code></h2>

Give the main parts flexible, human-readable labels.

- `title`
- `x`
- `y`

<h3 id='tooltip'><code>Tooltip</code></h3>

Tooltips are provided for each Geom for free. They're configurable and you can roll your own based on the relevant contextual information (x value, y value, etc). If you'd prefer the Geom to not use a tooltip, you can turn it off by passing `showTooltip={false}` to the Geom.

<h3 id='theme'><code>Theme</code></h3>

Customize the look and feel of your Graphique visualizations.

```jsx
// a custom theme
<Theme
  font={{ family: "Montserrat, -apple-system" }}
  grid={{ stroke: "none" }}
  axis={{ tickStroke: "#ddd" }}
  axisX={{ showAxisLine: true }}
  font={{ family: "Inter, system-ui, sans-serif" }}
/>
```

## Roadmap

- more `Geom`s
- linked graphics inside `<GGgroup>`
