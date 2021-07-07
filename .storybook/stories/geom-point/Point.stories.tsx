import React from 'react'
import { Story, Meta } from '@storybook/react'
import {
  GG,
  Labels,
  // ScaleX,
  // ScaleSize,
  Tooltip,
  Theme,
} from '@graphique/graphique'
import { GeomPoint, PointProps } from '@graphique/geom-point'
// import { LineProps } from "@graphique/geom-line/lib/geomLine"
import { penguins, Penguin, gapminder } from '@graphique/datasets'
// import { dedent } from 'ts-dedent'

export type Props = PointProps

export default {
  title: 'Geoms/GeomPoint',
  component: GeomPoint,
  decorators: [(Story) => <div style={{ maxWidth: 1100 }}>{Story()}</div>],
  // argTypes: {
  //   size: {
  //     description: "The size (radius) of the point in pixels",
  //     defaultValue: 2.5,
  //     table: {
  //       type: {
  //         summary: "number",
  //       },
  //     },
  //     control: {
  //       type: "range",
  //       min: 2,
  //       max: 6,
  //       step: 0.5,
  //     },
  //   },
  //   fill: {
  //     description: "The fill color of the point",
  //     defaultValue: { summary: "#777777ee" },
  //     table: {
  //       type: {
  //         summary: "string",
  //       },
  //     },
  //     control: {
  //       type: "select",
  //       options: [null, "rgb(3,127,81)", "tomato", "#000"],
  //     },
  //   },
  //   opacity: {
  //     description: "The opacity of the point",
  //     defaultValue: { summary: 1 },
  //     table: {
  //       type: {
  //         summary: "number",
  //       },
  //     },
  //     control: {
  //       type: "range",
  //       min: 0.2,
  //       max: 1,
  //       step: 0.2,
  //     },
  //   },
  //   stroke: {
  //     description: "The stroke color of the point",
  //     defaultValue: { summary: "#6495ed" },
  //     table: {
  //       type: {
  //         summary: "string",
  //       },
  //     },
  //     control: {
  //       type: "select",
  //       options: [null, "rgb(3,127,81)", "tomato", "#000", "#fff"],
  //     },
  //   },
  //   strokeOpacity: {
  //     description: "The stroke opacity of the point",
  //     defaultValue: { summary: 1 },
  //     table: {
  //       type: {
  //         summary: "number",
  //       },
  //     },
  //     control: {
  //       type: "range",
  //       min: 0.2,
  //       max: 1,
  //       step: 0.2,
  //     },
  //   },
  //   strokeWidth: {
  //     description: "The width of each point's stroke in pixels",
  //     defaultValue: { summary: 1 },
  //     table: {
  //       type: {
  //         summary: "number",
  //       },
  //     },
  //     control: {
  //       type: "range",
  //       min: 0.8,
  //       max: 3,
  //       step: 0.2,
  //     },
  //   },
  //   hideTooltip: {
  //     description: "Should the tooltip be hidden when interacting?",
  //     defaultValue: { summary: false },
  //     table: {
  //       type: {
  //         summary: "boolean",
  //       },
  //     },
  //   },
  //   focusedStyle: {
  //     description: "CSS properties applied to focused points",
  //     table: {
  //       type: {
  //         summary: `CSSProperties`,
  //       },
  //       defaultValue: {
  //         summary: `focusedStyle`,
  //         detail: dedent`
  //         {
  //           fillOpacity: 1,
  //           strokeOpacity: 1
  //         }`,
  //       },
  //     },
  //   },
  //   unfocusedStyle: {
  //     description: "CSS properties applied to unfocused points",
  //     table: {
  //       type: {
  //         summary: `CSSProperties`,
  //       },
  //       defaultValue: {
  //         summary: `unfocusedStyle`,
  //         detail: dedent`
  //         {
  //           fillOpacity: 0.15,
  //           strokeOpacity: 0.15
  //         }`,
  //       },
  //     },
  //   },
  //   onFocus: {
  //     description: "Callback when point is focused on interaction",
  //     table: {
  //       type: {
  //         summary: "onFocus",
  //         detail: `({data}: { data: unknown}) => void`,
  //       },
  //     },
  //   },
  //   onFocusSelection: {
  //     description: "Callback when focused point is clicked",
  //     table: {
  //       type: {
  //         summary: "onFocusSelection",
  //         detail: `({data}: { data: unknown}) => void`,
  //       },
  //     },
  //   },
  //   onExit: {
  //     description: "Callback when layer is moused out",
  //     table: {
  //       type: {
  //         summary: "onExit",
  //         detail: `() => void`,
  //       },
  //     },
  //   },
  // },
} as Meta

const BasicTemplate: Story = (args: Props) => (
  <GG
    data={penguins.filter((d) => d.flipperLength && d.beakLength)}
    aes={{
      x: (d: Penguin) => d.flipperLength,
      y: (d: Penguin) => d.beakLength,
      key: (d: Penguin) =>
        `${d.species}-${d.island}-${d.sex}-${d.beakDepth}-${d.bodyMass}-${d.beakLength}`,
      label: (d: Penguin) => d.species,
    }}
    // width={700}
    useParentWidth
    height={500}
  >
    <GeomPoint {...args} />
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
    x: (d) => d.flipperLength,
    y: (d) => d.beakLength,
    fill: (d) => d.species,
    label: (d) => d.species,
    key: (d) =>
      \`\${d.species}-\${d.island}-\${d.sex}-\${d.beakDepth}-\${d.bodyMass}-\${d.beakLength}\`
  }}
  useParentWidth
  height={500}
>
  <GeomPoint
    size={3.4}
    opacity={0.6}
  />
  <Labels
    x="Flipper length (mm)"
    y="Beak length (mm)"
  />
</GG>`,
    },
  },
}
// Basic.args = {
//   size: 3.4,
//   hideTooltip: false,
//   opacity: 0.6,
//   stroke: "",
//   fill: null,
//   strokeWidth: 1,
//   strokeOpacity: 1,
//   focusedStyle: { fillOpacity: 1, strokeOpacity: 1 },
//   unfocusedStyle: { fillOpacity: 0.15, strokeOpacity: 0.15 },
//   onFocusSelection: null
// }

// const AdvTemplate: Story = (args) => (
//   <div style={{maxWidth: 800}}>
//   <GG
//     data={gapminder.filter((d) => d.year === 2007)}
//     aes={{
//       x: (d) => d.gdpPercap,
//       y: (d) => d.lifeExp,
//       size: (d) => d.pop,
//       stroke: (d) => d.continent,
//       fill: (d) => d.continent,
//       label: (d) => d.country,
//       key: (d) => d.country,
//     }}
//     // width={600}
//     margin={{ left: 30 }}
//     useParentWidth
//     height={400}
//   >
//     <GeomPoint {...args} />
//     <Labels x="GDP (per capita)" y="Life expectancy (years)" />
//     <ScaleX
//       type={scaleLog}
//       numTicks={2}
//       format={(v: number) => {
//         if (v === 500) {
//           return `$${v}`
//         } else if ([1000, 2000, 5000, 10000, 20000, 40000, 80000].includes(v)) {
//           return `$${v / 1000}K`
//         }
//       }}
//     />
//     <ScaleSize range={[5, 35]} />
//     <Tooltip
//       keepInParent={false}
//       content={({ data }) => {
//         const { label } = data[0]
//         return (
//           <div>
//             <svg width={130} height={40}>
//               <text
//                 style={{
//                   fontFamily: "-apple-system, sans-serif",
//                   fontSize: 11,
//                   fontWeight: 600,
//                   strokeLinecap: "round",
//                   strokeLinejoin: "round",
//                 }}
//                 fill="#000"
//                 stroke="#fff"
//                 strokeWidth={3}
//                 paintOrder="stroke"
//                 x={2}
//                 y={26}
//               >
//                 {label}
//               </text>
//             </svg>
//           </div>
//         )
//       }}
//     />
//     <Theme
//       grid={{ stroke: null }}
//       axisX={{ hideAxisLine: false }}
//     />
//   </GG>
//   </div>
// )

// export const Advanced = AdvTemplate.bind({})

// Advanced.parameters = {
//   docs: {
//     source: {
//       code:
// `<GG
//   data={gapminder.filter((d) => d.year === 2007)}
//   aes={{
//     x: (d) => d.gdpPercap,
//     y: (d) => d.lifeExp,
//     size: (d) => d.pop,
//     stroke: (d) => d.continent,
//     fill: (d) => d.continent,
//     label: (d) => d.country,
//     key: (d) => d.country,
//   }}
//   margin={{ left: 30 }}
//   useParentWidth
//   height={400}
// >
//   <GeomPoint
//     opacity={0.35}
//     strokeOpacity={0.5}
//     strokeWidth={0.5}
//     stroke="#fff"
//     focusedStyle={{ stroke: "#fff", strokeWidth: 1.3 }}
//     unfocusedStyle={{ fillOpacity: 0.08, strokeOpacity: 0 }}
//   />
//   <Labels x="GDP (per capita)" y="Life expectancy (years)" />
//   <ScaleX
//     type={scaleLog}
//     numTicks={2}
//     format={(v: number) => {
//       if (v === 500) {
//         return \`\${v}\`
//       } else if ([1000, 2000, 5000, 10000, 20000, 40000, 80000].includes(v)) {
//         return \`\${v / 1000}K\`
//       }
//     }}
//   />
//   <ScaleSize range={[5, 35]} />
//   <Tooltip
//     keepInParent={false}
//     content={({ data }) => {
//       const { label } = data[0]
//       return (
//         <div>
//           <svg width={130} height={40}>
//             <text
//               style={{
//                 fontFamily: "-apple-system, sans-serif",
//                 fontSize: 11,
//                 fontWeight: 600,
//                 strokeLinecap: "round",
//                 strokeLinejoin: "round",
//               }}
//               fill="#000"
//               stroke="#fff"
//               strokeWidth={3}
//               paintOrder="stroke"
//               x={2}
//               y={26}
//             >
//               {label}
//             </text>
//           </svg>
//         </div>
//       )
//     }}
//   />
//   <Theme
//     grid={{ stroke: null }}
//     axisX={{ hideAxisLine: false }}
//   />
// </GG>`,
//     },
//   },
// }

// Advanced.args= {
//   fill: null,
//   size: null,
//   hideTooltip: false,
//   opacity: 0.35,
//   strokeOpacity: 0.5,
//   strokeWidth: 0.5,
//   stroke: "#fff",
//   focusedStyle: { stroke: "#fff", strokeWidth: 1.3 },
//   unfocusedStyle: { fillOpacity: 0.08, strokeOpacity: 0 },
//   onFocusSelection: null
// }
