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
import { GeomSmooth } from "@graphique/geom-smooth"
import { GeomPoint } from "@graphique/geom-point"
// import { LineProps } from "@graphique/geom-line/lib/geomLine"
import { cityTemperature } from "@visx/mock-data"
import { penguins } from "@graphique/datasets"
import { elongate, parseDate } from "@graphique/util"
import { schemeDark2 } from "d3-scale-chromatic"

const cityTempLong = elongate(cityTemperature, "city", "temperature", [
  "date",
]) as unknown[]

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
  title: "Geoms/GeomSmooth",
  component: GeomSmooth,
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
    fill: {
      description: "The fill color of the standard error band",
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
    fillOpacity: {
      description: "The fill opacity of the standard error band",
      defaultValue: { summary: 0.2 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 0.1,
        max: 1,
        step: 0.1,
      },
    },
    method: {
      description: "The type of smoothing to use",
      defaultValue: { summary: "loess" },
      table: {
        type: {
          summary: "method",
          detail: "loess | linear",
        },
      },
      control: {
        type: "select",
        options: ["loess", "linear"],
      },
    },
    se: {
      description: "Should the standard error be shown?",
      defaultValue: { summary: false },
      table: {
        type: {
          summary: "boolean",
        },
      },
    },
    level: {
      description:
        "The level of the confidence interval used for the standard error (linear only)",
      defaultValue: { summary: 0.95 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 0.8,
        max: 0.99,
        step: 0.01,
      },
    },
    band: {
      description: "The value for the band parameter used in the LOESS model (loess only)",
      defaultValue: { summary: 0.8 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 0.5,
        max: 0.9,
        step: 0.1,
      },
    },
    bins: {
      description: "The value for the bins parameter used in the LOESS model (loess only)",
      defaultValue: { summary: 80 },
      table: {
        type: {
          summary: "number",
        },
      },
      control: {
        type: "range",
        min: 20,
        max: 100,
        step: 10,
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
    data={penguins}
    aes={{
      x: d => d.flipperLength,
      y: d => d.beakLength
    }}
    useParentWidth
    height={500}
  >
    <GeomPoint hideTooltip opacity={0.3} />
    <GeomSmooth {...args} />
    <Labels x="Flipper length (mm)" y="Beak length (mm)" />
  </GG>
)

export const Basic = BasicTemplate.bind({})
Basic.parameters = {
  docs: {
    source: {
      code: `<GG
  data={penguins}
  aes={{
    x: d => d.flipperLength,
    y: d => d.beakLength
  }}
  useParentWidth
  height={500}
>
  <GeomPoint hideTooltip opacity={0.3} />
  <GeomSmooth />
  <Labels x="Flipper length (mm)" y="Beak length (mm)" />
</GG>
      `,
    },
  },
}
Basic.args = {
  se: true,
  method: "loess",
  level: 0.95,
  band: 0.8,
  size: 2.5,
  hideTooltip: false,
  stroke: null,
  fill: null,
  bins: 80,
  fillOpacity: 0.2,
  strokeOpacity: 1,
  strokeDashArray: null,
}

const MultiTemplate: Story = (args) => (
  <div style={{ padding: "20px 4px 20px 4px", background: "#111" }}>
    <GG
      data={cityTempLong}
      aes={{
        x: (d) => parseDate(d.date),
        y: (d) => parseFloat(d.temperature),
        stroke: (d) => d.city,
      }}
      height={380}
      useParentWidth
    >
      <GeomPoint size={2} opacity={0.3} strokeOpacity={0.3} hideTooltip />
      <GeomSmooth strokeOpacity={0.8} span={0.25} />
      <Labels x="Date" y="Temperature" />
      <ScaleY format={(d: number) => `${d}°F`} />
      <ScaleStroke scheme={schemeDark2} />
      {/* <ScaleSize values={[1, 2, 3]} /> */}
      {/* <ScaleDashArray values={[undefined, "2", "4"]} /> */}
      <Tooltip position="top" yFormat={(v) => `${v.toFixed(1)}°F`} />
      <ThemeDark />
    </GG>
  </div>
)

export const Multi = MultiTemplate.bind({})
Multi.parameters = {
  docs: {
    source: {
      code: `<GG
  data={cityTempLong}
  aes={{
    x: (d) => parseDate(d.date),
    y: (d) => parseFloat(d.temperature),
    stroke: (d) => d.city,
  }}
  height={380}
  useParentWidth
>
  <GeomPoint size={2} opacity={0.3} strokeOpacity={0.3} hideTooltip />
  <GeomSmooth strokeOpacity={0.8} span={0.25} />
  <Labels x="Date" y="Temperature" />
  <ScaleY format={(d: number) => \`\${d}°F\`} />
  <ScaleStroke scheme={schemeDark2} />
  <Tooltip position="top" yFormat={(v) => \`\${v.toFixed(1)}°F\`} />
  <ThemeDark />
</GG>
    `,
    },
  },
}
Multi.args = {
  strokeOpacity: 0.8,
  span: 0.25,
  stroke: null,
}
