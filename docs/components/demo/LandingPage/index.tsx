import { Sandpack } from '@codesandbox/sandpack-react'
import { githubLight } from '@codesandbox/sandpack-themes'
import { useMounted } from 'nextra/hooks'
import { useTheme } from 'nextra-theme-docs'

import graphiqueRaw from '#/input/graphique/build?raw'
import dts from '#/input/graphique/build/dts'
import dependencies from '#/input/graphique/build/dependencies'

import additionalDeps from '#/input/geom-point/build/dependencies'
import { additionalFiles } from './additionalFiles'
import { indexSrc, indexCssSrc, appSrc } from '../CodeEditor'
import styles from './styles.module.css'

const files = {
  'penguinsStyles.module.css': {
    code: `.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
}
  
.title {
  font-weight: bold;
}
  
.legend-title {
  font-weight: 600;
  font-size: 0.8rem;
}`,
  },
}

const src = `import {
  GG, Labels, BrushAction, LegendOrientation,
} from '@graphique/graphique';
import { GeomPoint, Legend } from '@graphique/geom-point';
import { penguins } from '@graphique/datasets';
import styles from './penguinsStyles.module.css';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.bodyMass,
      y: (d) => d.flipperLength,
      fill: (d) => d.species,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint brushAction={BrushAction.ZOOM} />
    <Labels
      header={
        <div className={styles.header}>
          <span className={styles.title}>🐧 Palmer Penguins</span>
          <Legend
            orientation={LegendOrientation.H}
            title={
              <span className={styles["legend-title"]}>Species</span>
            }
          />
        </div>
      }
      x="→ Body mass (g)"
      y="↑ Flipper length (mm)"
    />
  </GG>
);`

const HEIGHT = 590

export const Demo = () => {
  const { resolvedTheme } = useTheme()
  const isDark =
    typeof resolvedTheme === 'undefined' || resolvedTheme === 'dark'

  const isMounted = useMounted()

  return isMounted ? (
    <div className={styles.container}>
      <Sandpack
        template="react-ts"
        theme={isDark ? 'dark' : githubLight}
        options={{
          editorHeight: HEIGHT,
          rtl: true,
          showLineNumbers: true,
          showRefreshButton: false,
          editorWidthPercentage: 50,
        }}
        customSetup={{
          dependencies: {
            '@graphique/datasets': 'latest',
            ...dependencies,
            ...additionalDeps,
          },
        }}
        files={{
          '/node_modules/@graphique/graphique/package.json': {
            hidden: true,
            code: JSON.stringify({
              name: '@graphique/graphique',
              main: './dist/index.js',
              types: './dist/index.d.ts',
            }),
          },
          '/node_modules/@graphique/graphique/dist/index.js': {
            hidden: true,
            code: graphiqueRaw,
          },
          '/node_modules/@graphique/graphique/dist/index.d.ts': {
            hidden: true,
            code: dts,
          },
          '/index.tsx': {
            code: indexSrc,
            hidden: true,
          },
          '/App.tsx': {
            code: appSrc(src),
            active: true,
          },
          '/index.css': {
            code: indexCssSrc(isDark),
            hidden: true,
          },
          ...files,
          ...additionalFiles,
        }}
      />
    </div>
  ) : (
    <div style={{ height: HEIGHT }} />
  )
}
