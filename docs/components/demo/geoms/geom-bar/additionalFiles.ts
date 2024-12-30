import geom from '#/input/geom-bar/build?raw'
import dts from '#/input/geom-bar/build/dts'

const PKG = 'geom-bar'

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
