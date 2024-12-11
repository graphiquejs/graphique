import createNextra from 'nextra'
import createVercelToolbar from '@vercel/toolbar/plugins/next'

const withVercelToolbar = createVercelToolbar()

const withNextra = createNextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.module.rules.push({
      resourceQuery: /raw/,
      type: 'asset/source',
    })

    return config
  },
}

export default withNextra(withVercelToolbar(nextConfig))
