import createNextra from 'nextra'

const withNextra = createNextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const nextConfig = {
  reactStrictMode: false,
}

export default withNextra(nextConfig)
