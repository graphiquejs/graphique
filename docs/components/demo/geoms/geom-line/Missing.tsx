import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  '/utils.ts': {
    code: `import type { Stock } from '@graphique/datasets';
  
// manually create missing data
export const createMissingX = (d: Stock) => {
  const date = new Date(d.date);
  const shouldRemove = ['AAPL', 'AMZN', 'GOOG'].includes(d.symbol) &&
    date > new Date('02/01/2023') && date < new Date('07/01/2023');

  return shouldRemove ? undefined : date;
};

export const createMissingY = (d: Stock) => (
  d.marketCap < 700 ? null : d.marketCap
);`,
  },
}

const src = `import {
  GG, Labels, BrushAction, LegendOrientation,
} from "@graphique/graphique";
import { GeomLine, Legend, FocusType } from "@graphique/geom-line";
import { stocks, type Stock } from "@graphique/datasets";
import { createMissingX, createMissingY } from "./utils";

const App = () => (
  <GG
    data={stocks}
    aes={{
      x: createMissingX,
      y: createMissingY,
    }}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
    height={350}
    isContainerWidth
  >
    <GeomLine<Stock>
      aes={{
        stroke: (d) => d.symbol,
        strokeDasharray: (d) => d.symbol,
      }}
      brushAction={BrushAction.ZOOM}
      focusType={FocusType.CLOSEST}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Missing = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    height={400}
    showTabs
  />
)
