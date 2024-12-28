import label from '#/input/geom-label/build?raw'
import labelDts from '#/input/geom-label/build/dts'
import point from '#/input/geom-point/build?raw'
import pointDts from '#/input/geom-point/build/dts'
import line from '#/input/geom-line/build?raw'
import lineDts from '#/input/geom-line/build/dts'

const [PKG_1, PKG_2, PKG_3] = ['geom-label', 'geom-point', 'geom-line']

export const additionalFiles = {
  // dependency for PKG_1
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
    code: label,
  },
  [`/node_modules/@graphique/${PKG_1}/index.d.ts`]: {
    hidden: true,
    code: labelDts,
  },
  //
  [`/node_modules/@graphique/${PKG_3}/package.json`]: {
    hidden: true,
    code: JSON.stringify({
      name: `@graphique/${PKG_3}`,
      main: './index.js',
      types: './index.d.ts',
    }),
  },
  [`/node_modules/@graphique/${PKG_3}/index.js`]: {
    hidden: true,
    code: line,
  },
  [`/node_modules/@graphique/${PKG_3}/index.d.ts`]: {
    hidden: true,
    code: lineDts,
  },
}
