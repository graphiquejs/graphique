import { getSandpackCssText } from '@codesandbox/sandpack-react'
import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => (
  <Html lang="en" translate="no">
    <Head>
      <meta name="google" content="notranslate" />
      <style
        dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
        id="sandpack"
        key="sandpack-css"
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
