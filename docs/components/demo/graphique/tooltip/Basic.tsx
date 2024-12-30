import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  'tooltipStyles.module.css': {
    code: `.tooltip {
  background: #000;
  color: #fff;
  padding: 0.1rem 0.25rem;
  border: 1px solid #fff;
}`,
  },
}

const src = `import { GG, BrushAction, Tooltip, TooltipPosition } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomLine } from '@graphique/geom-line';
import styles from './tooltipStyles.module.css';

const App = () => (
  <GG
    data={stocks.filter((d) => d.symbol === 'NVDA')}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
    }}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
    height={350}
    isContainerWidth
  >
    <GeomLine
      attr={{ stroke: "#6aafa3" }}
      brushAction={BrushAction.ZOOM}
    />
    <Tooltip
      position={TooltipPosition.TOP}
      content={() => (
        <div className={styles.tooltip}>👋 Hello!</div>
      )}
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={370}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    showTabs
  />
)
