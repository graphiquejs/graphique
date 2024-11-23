import LogoButton from '../LogoButton';
import styles from './Footer.module.css';

const Footer: React.FC = () => (
  <footer className="_bg-gray-400 _pb-[env(safe-area-inset-bottom)] dark:n_bg-neutral-900 print:_bg-transparent">
    <hr className="dark:_border-neutral-800" />
    <div className="_mx-auto _max-w-[90rem] _justify-center _py-12 _text-gray-600 dark:_text-gray-300 md:_justify-start _pl-[max(env(safe-area-inset-left),1.5rem)] _pr-[max(env(safe-area-inset-right),1.5rem)]">
      <div className={styles.container}>
        <LogoButton isSmall />
        <p className={`_text-gray-400 ${styles.copyright}`}>
          Copyright &copy;
          {' '}
          {new Date().getFullYear()}
          {' '}
          Graphique
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
