import React from "react"
import { Story, Meta } from "@storybook/react"
import { GG, Labels } from "@graphique/gg"
import { penguins } from "@graphique/datasets"
import { GGProps } from "@graphique/gg/lib/ggBase"
import { dedent } from "ts-dedent"

export default {
  title: "GG/GG",
  component: GG,
  args: {
    data: penguins,
    aes: {
      x: (d: any) => d.flipperLength,
      y: (d: any) => d.beakLength,
    },
    margin: {
      left: 35,
    },
    useParentWidth: false,
    width: 500,
    height: 400,
  },
  argTypes: {
    data: {
      type: {
        required: true,
      },
      description:
        "The data used to create the base of the graphic. An array of objects",
      table: {
        type: {
          summary: "unknown[]",
        },
      },
      control: {
        type: null,
      },
    },
    aes: {
      description:
        "Functional mappings for data properties -> visual properties",
      table: {
        type: {
          summary: `AesType`,
          detail: dedent`
          {
            x: (d: any) => any
            y: (d: any) => any
            stroke?: (d: any) => any
            size?: (d: any) => any
            fill?: (d: any) => any
            group?: (d: any) => any
            label?: (d: any) => string
            key?: (d: any) => unknown
          }
          `,
        },
      },
      control: {
        type: null,
      },
      type: {
        required: true,
      },
    },
    margin: {
      description: "The margin surrounding the graphic",
      table: {
        type: {
          summary: `MarginType`,
          detail: dedent`
            { 
              top?: number
              right?: number
              bottom?: number
              left?: number
            }`,
        },
        defaultValue: {
          summary: `margin`,
          detail: dedent`
          {
            top: 8,
            right: 20,
            bottom: 35,
            left: 50
          }`,
        },
      },
    },
    useParentWidth: {
      description: "Should the graphic be the same width as its parent?",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: { summary: "false" },
      },
    },
    width: {
      description: "The total width of the graphic in pixels",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: { summary: 550 },
      control: {
        type: "range",
        min: 300,
        max: 1000,
        step: 100,
      },
    },
    height: {
      description: "The total height of the graphic in pixels",
      table: {
        type: {
          summary: "number",
        },
      },
      defaultValue: { summary: 300 },
      control: {
        type: "range",
        min: 200,
        max: 1000,
        step: 100,
      },
    },
  },
} as Meta

const Template: Story<GGProps> = (args: GGProps) => (
  <GG {...args}>
    <Labels
      x="X axis"
      y="Y axis"
    />
  </GG>
)

export const Base = Template.bind({})
Base.parameters = {
  docs: {
    source: {
      code: `
      <GG
        data={penguins}
        aes={{
          x: (d: any) => d.flipperLength,
          y: (d: any) => d.beakLength
        }}
        margin={{
          left: 35
        }}
        width={500}
        height={400}
      >
        <Labels
          x="X axis"
          y="Y axis"
        />
      </GG>
    `,
    },
  },
}
