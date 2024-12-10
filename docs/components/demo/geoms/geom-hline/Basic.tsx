import dependencies from '#/input/geom-hline/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomHLine } from '@graphique/geom-hline';

const App = () => (
  <div style={{ marginTop: 25 }}>
  <GG
    data={penguins.filter((d) => d.species === 'Chinstrap')}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d.flipperLength,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomHLine attr={{ stroke: '#6aafa3', strokeWidth: 1 }} />
  </GG>
  </div>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={480}
  />
)
