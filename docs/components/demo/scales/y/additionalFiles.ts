import line from '#/input/geom-line/build?raw'
import bar from '#/input/geom-bar/build?raw'
import lineDts from '#/input/geom-line/build/dts'
import barDts from '#/input/geom-bar/build/dts'

const PKG_1 = 'geom-line'
const PKG_2 = 'geom-bar'

export const additionalFiles = {
  [`/node_modules/@graphique/${PKG_1}/package.json`]: {
    hidden: true,
    code: JSON.stringify({
      name: `@graphique/${PKG_1}`,
      main: './index.js',
      types: './index.d.ts',
    }),
  },
  [`/node_modules/@graphique/${PKG_1}/index.js`]: {
    hidden: true,
    code: line,
  },
  [`/node_modules/@graphique/${PKG_1}/index.d.ts`]: {
    hidden: true,
    code: lineDts,
  },
  [`/node_modules/@graphique/${PKG_2}/package.json`]: {
    hidden: true,
    code: JSON.stringify({
      name: `@graphique/${PKG_2}`,
      main: './index.js',
      types: './index.d.ts',
    }),
  },
  [`/node_modules/@graphique/${PKG_2}/index.js`]: {
    hidden: true,
    code: bar,
  },
  [`/node_modules/@graphique/${PKG_2}/index.d.ts`]: {
    hidden: true,
    code: barDts,
  },
}
