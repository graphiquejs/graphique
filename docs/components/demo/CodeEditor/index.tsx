import { useCallback } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
  UnstyledOpenInCodeSandboxButton,
  ExportIcon,
  RestartIcon,
} from '@codesandbox/sandpack-react'
import { githubLight } from '@codesandbox/sandpack-themes'
import { useTheme } from 'nextra-theme-docs'
import { useMounted } from 'nextra/hooks'
import { PreviewIcon } from '#/components/typography/icons'

import graphiqueRaw from '#/input/graphique/build?raw'
import dts from '#/input/graphique/build/dts'
import dependencies from '#/input/graphique/build/dependencies'
import styles from './CodeEditor.module.css'

const indexSrc = `import React from "react";
import { createRoot } from "react-dom/client";
import './index.css'

import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <>
    <App />
  </>
);`

const appSrc = (src: string) => `${src}

export default App;
`

const indexCssSrc = (isDark: boolean) => `:root {
  color-scheme: dark;
}
html {
  scrollbar-width: thin;
  scrollbar-color: #73737366 transparent;
  scrollbar-gutter: stable;            
}
            
body {
  color: ${isDark ? '#fafafa' : '#111'};
  background: ${isDark ? '#131313' : '#fff'};
  transition: all 200ms linear;
  margin: 0 0 0 2px;
}`

interface Props {
  additionalDeps?: Record<string, string>
  additionalFiles?: Record<
    string,
    {
      code: string
      hidden?: boolean
    }
  >
  height?: number
  src: string
  showTabs?: boolean
  previewTitle?: string
}

const CustomResetButton = () => {
  const { sandpack } = useSandpack()
  const handleReset = useCallback(() => {
    sandpack.resetAllFiles()
  }, [sandpack])

  return (
    <button className="sp-preview-action" type="button" onClick={handleReset}>
      <RestartIcon />
      <span className="_sr-only">Reset demo</span>
    </button>
  )
}

export const CodeEditor = ({
  additionalDeps = {},
  additionalFiles = {},
  src,
  height = 455,
  showTabs = false,
  previewTitle = 'Preview',
}: Props) => {
  const { resolvedTheme } = useTheme()
  const isDark =
    typeof resolvedTheme === 'undefined' || resolvedTheme === 'dark'

  const isMounted = useMounted()

  return isMounted ? (
    <div className={styles.wrapper}>
      <SandpackProvider
        template="react-ts"
        theme={isDark ? 'dark' : githubLight}
        customSetup={{
          dependencies: {
            '@graphique/datasets': 'latest',
            ...dependencies,
            ...additionalDeps,
          },
        }}
        files={{
          '/node_modules/@graphique/graphique/package.json': {
            hidden: true,
            code: JSON.stringify({
              name: '@graphique/graphique',
              main: './dist/index.js',
              types: './dist/index.d.ts',
            }),
          },
          '/node_modules/@graphique/graphique/dist/index.js': {
            hidden: true,
            code: graphiqueRaw,
          },
          '/node_modules/@graphique/graphique/dist/index.d.ts': {
            hidden: true,
            code: dts,
          },
          '/index.tsx': {
            code: indexSrc,
            hidden: true,
          },
          '/App.tsx': {
            code: appSrc(src),
            active: true,
          },
          '/index.css': {
            code: indexCssSrc(isDark),
            hidden: true,
          },
          ...additionalFiles,
        }}
      >
        <SandpackLayout className={styles['layout-container-top']}>
          <div className={styles['preview-container']}>
            <div className={styles['preview-header']}>
              <div className={styles['preview-title']}>
                <PreviewIcon />
                {previewTitle}
              </div>
              <div className={styles['preview-controls']}>
                <CustomResetButton />
                <UnstyledOpenInCodeSandboxButton className="sp-preview-action">
                  <ExportIcon />
                </UnstyledOpenInCodeSandboxButton>
              </div>
            </div>
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              style={{ height }}
            />
          </div>
        </SandpackLayout>
        <SandpackLayout className={styles['layout-container-bottom']}>
          <SandpackCodeEditor showTabs={showTabs} className={styles.editor} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  ) : (
    <div style={{ height: height + 360 }} />
  )
}
