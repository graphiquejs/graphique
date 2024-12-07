import geom from '#/input/geom-histogram/build?raw'
import dts from '#/input/geom-histogram/build/dts'
import geomCol from '#/input/geom-col/build?raw'

const [PKG_1, PKG_2] = ['geom-histogram', 'geom-col']

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
    code: geomCol,
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
    code: geom,
  },
  [`/node_modules/@graphique/${PKG_1}/index.d.ts`]: {
    hidden: true,
    code: dts,
  },
}
