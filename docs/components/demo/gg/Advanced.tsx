import { SideBySideEditor } from '../SideBySideEditor';

const src = `import { GG } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';

const App = () => (
  <GG
    data={stocks}
    aes={{
      // transform input type to create date scale
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
    }}
    margin={{
      top: 5,
      right: 5,
      bottom: 20,
      left: 50,
    }}
    height={350}
    // make it responsive!
    isContainerWidth
  />
);`;

export const Advanced = () => <SideBySideEditor src={src} editorHeight={370} />;
