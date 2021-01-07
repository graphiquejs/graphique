import React from "react"
import { Story, Meta } from "@storybook/react"
import {
  GG,
  Labels,
  ScaleY,
  ScaleDashArray,
  ScaleStroke,
  ScaleSize,
  Tooltip,
  Theme,
} from "@graphique/gg"
import { GeomLine } from "@graphique/geom-line"
// import { LineProps } from "@graphique/geom-line/lib/geomLine"
import { appleStock, cityTemperature } from "@visx/mock-data"
import { elongate, parseDate } from "@graphique/util"
import { schemeDark2 } from "d3-scale-chromatic"

const cityTempLong = elongate(cityTemperature, "city", "temperature", ["date"]) as unknown[]

const ThemeDark = ({ ...props }) => {
  return (
    <Theme
      axis={{
        tickLabelColor: "#999",
        labelColor: "#aaa",
      }}
      grid={{ stroke: "#77777723" }}
      markerStroke="#000"
      titleColor="#eee"
      {...props}
    />
  )
}

export default {
  title: "Geoms/GeomLine",
  component: GeomLine,
  decorators: [(Story) => <div style={{ maxWidth: 1100 }}>{Story()}</div>],
  argTypes: {
    size: {
      description: "The size (thickness) of the line in pixels",
      defaultValue: { summary: 2.5 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 1.4,
        max: 4,
        step: 0.2,
      },
    },
    stroke: {
      description: "The stroke color of the line",
      defaultValue: { summary: "#6495ed" },
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "select",
        options: [null, "rgb(3,127,81)", "tomato", "#000"],
      },
    },
    strokeOpacity: {
      description: "The stroke opacity of the line",
      defaultValue: { summary: 1 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 0.2,
        max: 1,
        step: 0.2,
      },
    },
    strokeDashArray: {
      description: "The stroke pattern of the line",
      // defaultValue: { summary: "null" },
      table: {
        type: {
          summary: "string",
        },
      },
      control: {
        type: "select",
        options: ["0", "6, 3", "2, 2", "4"],
      },
    },
    animate: {
      description: "Should the line have an animated entrance along its path?",
      defaultValue: { summary: false },
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    hideTooltip: {
      description: "Should the tooltip be hidden when interacting?",
      defaultValue: { summary: false },
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
  },
} as Meta

const BasicTemplate: Story = (args) => (
  <GG
    data={appleStock.slice(400, 700)}
    aes={{
      x: d => new Date(d.date),
      y: d => d.close,
    }}
    // margin={{ left: 40 }}
    useParentWidth
  >
    <GeomLine {...args} />
    {/* <Labels title="AAPL Stock Price" /> */}
    {/* <Tooltip yFormat={(y) => `$${y.toFixed(2)}`} /> */}
    {/* <ScaleY format={(y: number) => `$${y}`} /> */}
  </GG>
)

export const Basic = BasicTemplate.bind({})
Basic.parameters = {
  docs: {
    source: {
      code: 
`<GG
  data={appleStock.slice(400, 700)}
  aes={{
    x: d => new Date(d.date),
    y: d => d.close,
  }}
  useParentWidth
>
  <GeomLine />
</GG>
      `
    }
  }
}
Basic.args = {
  size: 2.6,
  animate: false,
  hideTooltip: false,
  stroke: "",
  strokeOpacity: 1,
  strokeDashArray: null
}

const MultiTemplate: Story = (args) => (
  <div style={{padding: "20px 4px 20px 4px", background: "#111"}}>
    <GG
      data={cityTempLong}
      aes={{
        x: (d: any) => parseDate(d.date),
        y: (d: any) => parseFloat(d.temperature),
        stroke: (d: any) => d.city,
      }}
      height={380}
      useParentWidth
    >
      <GeomLine strokeOpacity={0.8} />
      <Labels
        x="Date"
        y="Temperature"
      />
      <ScaleY format={(d: number) => `${d}°F`} />
      <ScaleDashArray values={[undefined, "2", "4"]} />
      <ScaleStroke scheme={schemeDark2} />
      <ScaleSize values={[1, 2, 3]} />
      {/* <Labels title="AAPL Stock Price" x={null} y={null} /> */}
      <Tooltip position="top" yFormat={(v: number) => `${v.toFixed(1)}°F`} />
      <ThemeDark />
    </GG>
  </div>
)

export const Multi = MultiTemplate.bind({})
Multi.parameters = {
  docs: {
    source: {
      code: 
`<GG
  data={cityTempLong}
  aes={{
    x: (d) => parseDate(d.date),
    y: (d) => parseFloat(d.temperature),
    stroke: (d) => d.city,
  }}
  height={380}
  useParentWidth
>
  <GeomLine strokeOpacity={0.8} />
  <Labels
    x="Date"
    y="Temperature"
  />
  <ScaleY format={(d: number) => \`\${d}°F\`} />
  <ScaleDashArray values={[undefined, "2", "4"]} />
  <ScaleStroke scheme={schemeDark2} />
  <ScaleSize values={[1, 2, 3]} />
  <Tooltip position="top" yFormat={(v) => \`\${v.toFixed(1)}°F\`} />
  <ThemeDark />
</GG>`,
    },
  },
}
Multi.args = {
  strokeOpacity: 0.8,
  animate: false,
  stroke: null
}