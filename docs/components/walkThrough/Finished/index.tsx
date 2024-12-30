/* eslint-disable no-template-curly-in-string */
import { useTheme } from 'nextra-theme-docs'
import pointDeps from '#/input/geom-point/build/dependencies'
import lineDeps from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const additionalDeps = {
  '@types/d3-scale': '^4.0.8',
  '@types/d3-array': '^3.2.1',
}

const billions =
  '${(v / B).toLocaleString(undefined, { maximumFractionDigits: 1 })}B'
const millions = '${(v / M)}M'

const files = (isDark: boolean) => ({
  '/contexts/GapMinderContext.tsx': {
    code: `import React, { createContext, useState, useCallback, useMemo } from "react";
import { gapminder, type GapMinder } from "@graphique/datasets";
import { extent } from "d3-array";

interface IGapMinderContext {
  continents: string[];
  includedCountries: GapMinder[];
  focusedCountry?: GapMinder;
  setFocusedCountry: React.Dispatch<GapMinder | undefined>;
  focusedCountryTrend?: GapMinder[];
  xExtent: [number, number];
  yExtent: [number, number];
  handleLegendSelection: (v: string) => void;
}

const continents = Array.from(
  new Set(gapminder.map((d) => d.continent))
).sort();

export const GapMinderContext = createContext<IGapMinderContext>(
  {} as IGapMinderContext
);

export const GapMinderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [focusedCountry, setFocusedCountry] = useState<GapMinder | undefined>();
  const [selectedContinents, setSelectedContinents] = useState(continents);

  const handleLegendSelection = useCallback((v: string) => {
    setSelectedContinents((prev) => {
      if (prev.includes(v) && prev.length === 1) {
        return continents;
      }
      if (prev.includes(v)) {
        return prev.filter((p) => p !== v);
      }
      return [...prev, v];
    });

    if (focusedCountry?.continent === v) {
      setFocusedCountry(undefined);
    }
  }, []);

  const focusedCountryTrend = useMemo(
    () => gapminder.filter((d) => d.country === focusedCountry?.country),
    [focusedCountry]
  );

  const includedCountries = useMemo(
    () =>
      gapminder.filter(
        (d) => d.year === 2007 && selectedContinents.includes(d.continent)
      ),
    [selectedContinents]
  );

  const xExtent = useMemo(
    () =>
      extent(
        gapminder.filter((d) => selectedContinents.includes(d.continent)),
        (d) => d.gdpPercap
      ) as [number, number],
    [selectedContinents]
  );

  const yExtent = useMemo(
    () =>
      extent(
        gapminder.filter((d) => selectedContinents.includes(d.continent)),
        (d) => d.lifeExp
      ) as [number, number],
    [selectedContinents]
  );

  const contextValue: IGapMinderContext = {
    continents,
    includedCountries,
    focusedCountry,
    setFocusedCountry,
    focusedCountryTrend,
    xExtent,
    yExtent,
    handleLegendSelection,
  };

  return (
    <GapMinderContext.Provider value={contextValue}>
      {children}
    </GapMinderContext.Provider>
  );
};
`,
  },
  '/components/index.ts': {
    code: `export * from "./CountryTrend";
export * from "./CountryLabel";
export * from "./Scales";
export * from "./Legends";
`,
  },
  '/components/CountryTrend.tsx': {
    code: `import { useContext } from "react";
import { GeomPoint } from "@graphique/geom-point";
import { GeomLine } from "@graphique/geom-line";
import { GapMinderContext } from "../contexts/GapMinderContext";

const CountryTrend = () => {
  const { focusedCountryTrend } = useContext(GapMinderContext);

  return focusedCountryTrend ? (
    <>
      <GeomLine
        data={focusedCountryTrend}
        showTooltip={false}
        attr={{ strokeWidth: 2, strokeOpacity: 0.8 }}
        isAnimated={false}
      />
      <GeomPoint
        data={focusedCountryTrend}
        showTooltip={false}
        attr={{ fill: ${
          isDark ? "'#000'" : "'#fff'"
        }, fillOpacity: 0.8, r: 2.3 }}
        isAnimated={false}
      />
    </>
  ) : null;
};

CountryTrend.displayName = "CountryTrendGeoms";

export { CountryTrend };
`,
  },
  '/components/CountryLabel.tsx': {
    code: `import { useContext } from "react";
import { GeomLabel } from "@graphique/geom-label";
import { GapMinderContext } from "../contexts/GapMinderContext";

const CountryLabel = () => {
  const { focusedCountry } = useContext(GapMinderContext);

  return focusedCountry ? (
    <GeomLabel
      data={[focusedCountry]}
      attr={{
        fill: "currentColor",
        stroke: ${isDark ? "'#000'" : "'#fff'"},
        strokeOpacity: 0.7,
        fontSize: "0.8rem",
      }}
      isAnimated={false}
    />
  ) : null;
};

CountryLabel.displayName = "LabelGeom";

export { CountryLabel };
`,
  },
  '/components/Scales.tsx': {
    code: `import { useContext } from "react";
import { ScaleX, ScaleY, ScaleFill, ScaleStroke } from "@graphique/graphique";
import { scaleLog } from "d3-scale";
import { GapMinderContext } from "../contexts/GapMinderContext";
import { formatXTick, getNumXTicks } from "../utils/formattingUtils";

export const Scales = () => {
  const { continents, xExtent, yExtent } = useContext(GapMinderContext);

  return (
    <>
      <ScaleX
        type={scaleLog}
        format={formatXTick}
        numTicks={getNumXTicks}
        domain={xExtent}
      />
      <ScaleY domain={yExtent} />
      <ScaleFill domain={continents} />
      <ScaleStroke domain={continents} />
    </>
  );
};
`,
  },
  '/components/Legends.tsx': {
    code: `import { useContext } from "react";
import { LegendOrientation } from "@graphique/graphique";
import { Legend, SizeLegend } from "@graphique/geom-point";
import { formatPop } from "../utils/formattingUtils";
import { GapMinderContext } from "../contexts/GapMinderContext";
import styles from "../gapMinder.module.css";

export const Legends = () => {
  const { handleLegendSelection } = useContext(GapMinderContext);

  return (
    <div className={styles.legends}>
      <Legend
        orientation={LegendOrientation.H}
        title={<span className={styles["legend-title"]}>Continent</span>}
        onSelection={handleLegendSelection}
      />
      <SizeLegend
        title={<span className={styles["legend-title"]}>Population</span>}
        format={formatPop}
      />
    </div>
  );
};
`,
  },
  '/utils/formattingUtils.ts': {
    code: `// formats numbers as dollar values
const formatGDP = (v: number, includeCents = true): string => (
  v.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: !includeCents ? 0 : undefined,
  })
);

// generate sequence of log tick labels and format them as decimal-less $
const MAX_EXPONENT = 6;
const EXPONENTS = Array.from(Array(MAX_EXPONENT).keys());
const BASE = 10;
const generateTickSequence = (vals: number[]): number[] => (
  EXPONENTS.flatMap((x: number) => vals.map((v) => v * (BASE ** x)))
);
const INITIAL_VALS = [1, 2, 5];
const LOG_SCALE_TICKS = [0, ...generateTickSequence(INITIAL_VALS)];

const formatXTick = ({ value }: { value: number }): string => (
  LOG_SCALE_TICKS.includes(value)
    ? formatGDP(value, false) // no decimal
    : ''
);

// show fewer x ticks when the chart is narrow. otherwise, use Graphique's default
const NARROW_WIDTH = 600;
const NUM_NARROW_TICKS = 2;
const getNumXTicks = (width: number): number | undefined => (
  width < NARROW_WIDTH ? NUM_NARROW_TICKS : undefined
);

const formatPop = (v: number): string => {
  const B = 1000000000;
  const M = 1000000;

  if (v >= B)
    return \`${billions}\`;
  if (v >= M)
    return \`${millions}\`;
  return v.toLocaleString();
};

export { formatGDP, formatXTick, getNumXTicks, formatPop };`,
  },
  '/gapMinder.module.css': {
    code: `.title {
  font-weight: 700;
}

.legends {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  column-gap: 1.5rem;
  padding: 0.5rem 0 1rem 0;
}

.legend-title {
  font-size: 0.8rem;
  font-weight: 700;
}
    `,
  },
})

const customIndexSrc = `import { createRoot } from "react-dom/client";
import { GapMinderProvider } from "./contexts/GapMinderContext";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <>
    <GapMinderProvider>
      <App />
    </GapMinderProvider>
  </>
);
`

const getSrc = () => `import { useContext } from "react";
import { GG, Labels, Tooltip, Theme } from "@graphique/graphique";
import { GeomPoint } from "@graphique/geom-point";
import { type GapMinder } from "@graphique/datasets";
import { Legends } from "./components";
import { GapMinderContext } from "./contexts/GapMinderContext";
import { CountryTrend, CountryLabel, Scales } from "./components";
import styles from "./gapMinder.module.css";

const App = () => {
  const { includedCountries, setFocusedCountry } = useContext(GapMinderContext);

  return (
    <GG
      data={includedCountries}
      aes={{
        x: (d) => d.gdpPercap,
        y: (d) => d.lifeExp,
        label: (d) => d.country,
        fill: (d) => d.continent,
        stroke: (d) => d.continent,
        size: (d) => d.pop,
      }}
      margin={{ top: 30, right: 30, left: 35 }}
      isContainerWidth
    >
      <CountryTrend />
      <GeomPoint<GapMinder>
        key="countries"
        aes={{ key: (d) => d.country }}
        attr={{ fillOpacity: 0.35, strokeOpacity: 0.4 }}
        focusedStyle={{ fillOpacity: 1 }}
        onDatumFocus={(d) => setFocusedCountry(d?.[0])}
        onExit={() => setFocusedCountry(undefined)}
      />
      <CountryLabel />
      <Scales />
      <Tooltip content={() => null} />
      <Labels
        x="GDP per capita"
        y="Life expectancy (years)"
        header={
          <span className={styles.title}>The health and wealth of nations</span>
        }
      />
      <Legends />
      <Theme grid={{ stroke: null }} axis={{ showAxisLine: true }} />
    </GG>
  );
};`

const Finished = () => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <CodeEditor
      src={getSrc()}
      height={620}
      additionalDeps={{ ...lineDeps, ...pointDeps, ...additionalDeps }}
      additionalFiles={{ ...additionalFiles, ...files(isDark) }}
      showTabs
      showFileExplorer
      customIndexSrc={customIndexSrc}
    />
  )
}

export default Finished
