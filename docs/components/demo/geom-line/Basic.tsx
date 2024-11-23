import { SideBySideEditor } from '../SideBySideEditor';

const src = `import { GG } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomLine } from '@graphique/geom-line';

const App = () => (
  <GG
    data={stocks.filter((d) => d.symbol === 'NVDA')}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
    }}
    margin={{
      top: 20,
      right: 5,
      bottom: 20,
      left: 50,
    }}
    height={350}
    isContainerWidth
  >
    <GeomLine stroke="#6aafa3" />
  </GG>
);`;

const additionalDeps = {
  '@graphique/geom-line': 'latest',
};

export const Basic = () => (
  <SideBySideEditor
    src={src}
    additionalDeps={additionalDeps}
    editorHeight={370}
  />
);
