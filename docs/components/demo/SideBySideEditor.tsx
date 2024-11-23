import { Sandpack } from '@codesandbox/sandpack-react';
import { useTheme } from 'nextra-theme-docs';

// TODO: configure to use locally-bundled packages as dependencies
// see: https://sandpack.codesandbox.io/docs/guides/local-dependencies

const indexSrc = `import React from "react";
import { createRoot } from "react-dom/client";
import './index.css'

import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <>
    <App />
  </>
);`;

const appSrc = (src: string) => `${src}

export default App;
`;

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
}`;

interface Props {
  /** { pkgName: pkgVersion }  */
  additionalDeps?: Record<string, string>
  editorHeight?: number
  src: string
}

export const SideBySideEditor = ({
  additionalDeps = {},
  src,
  editorHeight = 470,
}: Props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ padding: '2rem 0 0.5rem 0' }}>
      <Sandpack
        template="react-ts"
        theme={isDark ? 'dark' : 'light'}
        customSetup={{
          dependencies: {
            '@graphique/graphique': 'latest',
            '@graphique/datasets': 'latest',
            ...additionalDeps,
          },
        }}
        files={{
          '/index.tsx': {
            code: indexSrc,
            hidden: true,
          },
          '/App.tsx': appSrc(src),
          '/index.css': {
            code: indexCssSrc(isDark),
            hidden: true,
          },
        }}
        options={{
          editorHeight,
          showTabs: true,
          showLineNumbers: true,
          showRefreshButton: false,
          rtl: true,
        }}
      />
    </div>
  );
};
