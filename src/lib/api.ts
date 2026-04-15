// src/lib/api.ts
export function getBaseUrl() {
  // Côté serveur en production (Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Variable explicite si définie
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback local
  return 'http://localhost:3000'
}