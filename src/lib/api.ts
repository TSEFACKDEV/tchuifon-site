// src/lib/api.ts
function withoutTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

export function getBaseUrl() {
  // 1. URL publique explicite (domaine de production / local)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return withoutTrailingSlash(process.env.NEXT_PUBLIC_APP_URL)
  }

  // 2. Domaine de production Vercel (stable), avant l'URL de déploiement
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // 3. URL du déploiement courant (preview ou production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 4. Fallback local
  return 'http://localhost:3000'
}
