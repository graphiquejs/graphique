import { useTheme } from 'nextra-theme-docs'
import dependencies from '#/input/geom-label/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const getSrc = (isDark: boolean) => `import {
  GG, Labels, BrushAction, LegendOrientation,
} from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomLabel, Legend } from '@graphique/geom-label';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d.flipperLength,
      fill: (d) => d.species,
      label: (d) => d.species,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomLabel brushAction={BrushAction.ZOOM} attr={{ stroke: '${
      isDark ? '#111' : '#fafafa'
    }' }} />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Basic = () => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <CodeEditor
      src={getSrc(isDark)}
      height={490}
      additionalDeps={dependencies}
      additionalFiles={additionalFiles}
    />
  )
}
