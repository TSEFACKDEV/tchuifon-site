// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME ?? 'dgpt66w4z'

const nextConfig: NextConfig = {
  experimental: {
    // Le layout racine est situé sous [locale], il faut donc une 404 globale
    // pour les URLs qui ne correspondent à aucun segment localisé.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: `/${cloudinaryCloudName}/**`,
      },
    ],
  },
}

export default withNextIntl(nextConfig)
