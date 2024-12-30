import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { useState } from 'react';
import {
  GG, Labels, Tooltip, ScaleY, defaultScheme,
} from '@graphique/graphique';
import { GeomLine, Legend } from '@graphique/geom-line';
import { stocks } from '@graphique/datasets';

const symbols = Array.from(new Set(stocks.map((d) => d.symbol)));

const App = () => {
  const [focusedIndex, setFocusedIndex] = useState<number[] | undefined>([123]);

  return (
    symbols.map((symbol, ind) => {
      const data = stocks.filter((d) => d.symbol === symbol);
      const focusedDatum =
        typeof focusedIndex !== 'undefined'
          ? [data[focusedIndex[0]]]
          : undefined;

      return (
        <div key={symbol} style={{ marginTop: 20 }}>
          <GG
            data={data}
            aes={{
              x: (d) => new Date(d.date),
              y: (d) => d.marketCap,
            }}
            height={120}
            margin={{ top: 5, left: 50 }}
            isContainerWidth
          >
            <GeomLine
              markerRadius={2.5}
              attr={{ stroke: defaultScheme[ind] }}
              onDatumFocus={(_, i) => setFocusedIndex(i)}
              onExit={() => setFocusedIndex(undefined)}
            />
            <Labels header={<span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{symbol}</span>} />
            <ScaleY numTicks={3} />
            <Tooltip datum={focusedDatum} />
          </GG>
        </div>
      );
    })
  );
};`

export const Programmatic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={728}
  />
)
