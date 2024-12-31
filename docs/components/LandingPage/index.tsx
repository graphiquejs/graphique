import { Demo } from '#/components/demo/LandingPage'
import { Hr } from '../Exports'
import styles from './styles.module.css'

const Stub = ({ children }: { children?: React.ReactNode }) => (
  <span className={styles.stub}>{children}</span>
)

export const LandingPage = () => (
  <>
    <main className={styles['main-content']}>
      <div className={styles.hero}>
        <h1 className={styles['hero-text']}>
          <Stub>A Grammar of Graphics&nbsp;</Stub>
          <Stub>for React</Stub>
        </h1>
        <div>
          <h2 className={styles.tagline}>
            <Stub>Graphique is an integrated system</Stub>
            <Stub>
              &nbsp;for{' '}
              <span className={styles['tagline-highlight']}>
                visualizing data
              </span>
            </Stub>
            <Stub>&nbsp;with React components.</Stub>
          </h2>
        </div>
      </div>
      <div className={styles.cta}>
        <a className={styles['cta-button']} href="/docs">
          Get Started
          <div className={styles['forward-icon']}>→</div>
        </a>
      </div>
      <Hr className={styles.hr} />
      <div className={styles['landing-demo-wrapper']}>
        <div className={styles['landing-demo-container']}>
          <Demo />
        </div>
      </div>
    </main>
  </>
)
