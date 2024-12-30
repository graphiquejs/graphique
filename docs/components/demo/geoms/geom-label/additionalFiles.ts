import label from '#/input/geom-label/build?raw'
import labelDts from '#/input/geom-label/build/dts'
import point from '#/input/geom-point/build?raw'
import pointDts from '#/input/geom-point/build/dts'

const [PKG_1, PKG_2] = ['geom-label', 'geom-point']

export const additionalFiles = {
  // dependency for PKG_1
  [`/node_modules/@graphique/${PKG_2}/package.json`]: {
    hidden: true,
    code: JSON.stringify({
      name: `@graphique/${PKG_2}`,
      main: './index.js',
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
}
