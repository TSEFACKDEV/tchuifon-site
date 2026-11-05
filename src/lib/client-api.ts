'use client'

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    return res.ok
  } catch {
    return false
  }
}

/**
 * `fetch` avec renouvellement transparent de la session.
 * En cas de 401, tente une seule rotation du refresh token puis rejoue la requête.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  if (response.status !== 401) return response

  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null
  })

  const refreshed = await refreshPromise
  return refreshed ? fetch(input, init) : response
}
