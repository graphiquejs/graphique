import {
  GG, Labels, ScaleX, Tooltip,
} from '@graphique/graphique';
import { GeomPoint } from '@graphique/geom-point';
import { gapminder } from '@graphique/datasets';
import { useEffect, useState } from 'react';
import { scaleLog } from 'd3-scale';
import styles from './gapMinder.module.css';
import { formatGDP, formatXTicks, getNumXTicks } from './formattingUtils';

const data = gapminder.filter((d) => d.year === 2007);

const LogX: React.FC = () => {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    setIsServer(false);
  }, []);

  return isServer
    ? <div style={{ height: 500 }} />
    : (
      <div className={styles.gapMinderContainer} style={{ paddingBottom: 60 }}>
        <GG
          data={data}
          aes={{
            x: (d) => d.gdpPercap,
            y: (d) => d.lifeExp,
            label: (d) => d.country,
          }}
          isContainerWidth
        >
          <GeomPoint
            opacity={0.7}
            fill="#298670"
            r={3}
            isClipped={false}
          />
          <ScaleX
            type={scaleLog}
            format={formatXTicks}
            numTicks={getNumXTicks}
          />
          <Tooltip xFormat={formatGDP} />
          <Labels
            x="GDP per capita"
            y="Life expectancy (years)"
            header={
              <span className={styles.gapMinderHeader}>The health and wealth of nations</span>
            }
          />
        </GG>
      </div>
    );
};

export default LogX;
