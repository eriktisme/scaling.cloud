import './src/env'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './languages/en-US.json',
  },
})

export default withNextIntl(nextConfig)
