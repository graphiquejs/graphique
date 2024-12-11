import { useTheme } from 'nextra-theme-docs'
import dependencies from '#/input/geom-label/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const getSrc = (isDark: boolean) => `import {
  GG, Labels, BrushAction, Tooltip,
} from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomLabel } from '@graphique/geom-label';
import { GeomPoint } from '@graphique/geom-point';

const data = penguins.map((d, i) => ({ ...d, i }));
const focused = data[123];

const App = () => (
  <GG
    data={data}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d.flipperLength,
      key: (d) => String(d.i),
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint
      attr={{ fill: '#6aafa3' }}
      brushAction={BrushAction.ZOOM}
      focusedKeys={[String(focused.i)]}
    />
    <GeomLabel
      data={[focused]}
      aes={{ label: () => 'My favorite 🐧' }}
      attr={{
        fontSize: '0.9rem',
        fill: 'currentColor',
        stroke: '${isDark ? '#111' : '#fafafa'}',
      }}
    />
    <Tooltip content={() => null} />
  </GG>
);`

export const Data = () => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <CodeEditor
      src={getSrc(isDark)}
      height={454}
      additionalDeps={dependencies}
      additionalFiles={additionalFiles}
    />
  )
}
