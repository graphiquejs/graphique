import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  'penguinsStyles.module.css': {
    code: `.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  row-gap: 0.8rem;
  padding: 0.5rem 0.1rem 1rem 0.1rem;
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

const src = `import { GG, Labels, BrushAction, LegendOrientation } from '@graphique/graphique';
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
            title={<span className={styles["legend-title"]}>Species</span>}
          />
        </div>
      }
      x="&rarr; Body mass (g)"
      y="&uarr; Flipper length (mm)"
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={575}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    showTabs
  />
)
