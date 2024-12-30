import geom from '#/input/geom-point/build?raw'
import dts from '#/input/geom-point/build/dts'

const PKG = 'geom-point'

export const additionalFiles = {
  [`/node_modules/@graphique/${PKG}/package.json`]: {
    hidden: true,
    code: JSON.stringify({
      name: `@graphique/${PKG}`,
      main: './index.js',
      types: './index.d.ts',
    }),
  },
  [`/node_modules/@graphique/${PKG}/index.js`]: {
    hidden: true,
    code: geom,
  },
  [`/node_modules/@graphique/${PKG}/index.d.ts`]: {
    hidden: true,
    code: dts,
  },
}
