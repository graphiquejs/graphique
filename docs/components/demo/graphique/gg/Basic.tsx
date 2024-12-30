import { CodeEditor } from '#/components/demo/CodeEditor'

const src = `import { GG } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.bodyMass,
      y: (d) => d.flipperLength,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  />
);`

export const Basic = () => <CodeEditor src={src} />
