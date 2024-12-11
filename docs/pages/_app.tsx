import type { AppProps } from 'next/app'
import { VercelToolbar } from '@vercel/toolbar/next'
import './styles.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
  const shouldInjectToolbar = process.env.NODE_ENV === 'development'

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
      {shouldInjectToolbar && <VercelToolbar />}
    </>
  )
}

export default MyApp
