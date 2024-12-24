import col from '#/input/geom-col/build?raw'
import colDts from '#/input/geom-col/build/dts'
import point from '#/input/geom-point/build?raw'
import pointDts from '#/input/geom-point/build/dts'

const PKG_1 = 'geom-col'
const PKG_2 = 'geom-point'

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
    code: col,
  },
  [`/node_modules/@graphique/${PKG_1}/index.d.ts`]: {
    hidden: true,
    code: colDts,
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
    code: point,
  },
  [`/node_modules/@graphique/${PKG_2}/index.d.ts`]: {
    hidden: true,
    code: pointDts,
  },
}
