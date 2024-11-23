import { SideBySideEditor } from '../SideBySideEditor';

const src = `import { GG } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.bodyMass,
      y: (d) => d.flipperLength,
    }}
    margin={{ left: 35 }}
    isContainerWidth
  />
);`;

export const Basic = () => <SideBySideEditor src={src} />;
