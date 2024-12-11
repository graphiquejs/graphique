/* eslint-disable react-hooks/rules-of-hooks */
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'
import LogoButton from './components/LogoButton'
import Footer from './components/Footer'
import { P, H1, A } from './components/typography'
import ThemeToggle from './components/ThemeToggle'
import { Spacer } from './components/Spacer'

const G = 'Graphique'

const config: DocsThemeConfig = {
  main: ({ children }) => {
    const { asPath } = useRouter()
    const isGeom = asPath.includes('/geoms/')
    const { frontMatter } = useConfig()

    return (
      <>
        {isGeom && <Spacer />}
        {!isGeom && frontMatter.title && <H1>{frontMatter.title}</H1>}
        {children}
      </>
    )
  },
  head() {
    const { asPath } = useRouter()
    const { title } = useConfig()

    const isGeom = asPath.includes('/geoms/')

    if (asPath === '/') {
      return <title>{G}</title>
    }
    return (
      <title>{`${G} | ${
        asPath === '/docs' ? 'Docs' : `${isGeom ? 'Geom' : ''}${title}`
      }`}</title>
    )
  },
  // faviconGlyph: '◈',
  logo: <LogoButton />,
  navbar: {
    extraContent: <ThemeToggle />,
  },
  themeSwitch: {
    component: null,
  },
  project: {
    link: 'https://github.com/graphiquejs/graphique',
  },
  footer: {
    component: <Footer />,
    content: null,
  },
  sidebar: {
    toggleButton: false,
  },
  docsRepositoryBase: 'https://github.com/graphiquejs/graphique.dev',
  toc: {
    backToTop: true,
  },
  editLink: {
    content: null,
  },
  feedback: {
    content: null,
  },
  gitTimestamp: null,
  color: {
    hue: 170,
    saturation: 40,
  },
  components: {
    h1: H1,
    p: P,
    a: A,
  },
}

export default config
