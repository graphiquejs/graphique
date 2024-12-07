import { getSandpackCssText } from '@codesandbox/sandpack-react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
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
}
