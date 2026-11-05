import jwt, { type SignOptions } from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m'
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d'

/**
 * Convertit une durée JWT (`15m`, `7d`, `12h`, `30s`) en secondes.
 * Utilisé pour aligner `maxAge` des cookies sur la durée réelle du token.
 */
function durationToSeconds(value: string, fallback: number): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim())
  if (!match) return fallback

  const amount = Number(match[1])
  const unit = match[2]
  const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400

  return amount * multiplier
}

export const ACCESS_TOKEN_MAX_AGE = durationToSeconds(ACCESS_EXPIRES, 15 * 60)
export const REFRESH_TOKEN_MAX_AGE = durationToSeconds(REFRESH_EXPIRES, 7 * 24 * 60 * 60)

export function signAccessToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES as SignOptions['expiresIn'],
  })
}

export function signRefreshToken(payload: { userId: string }) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES as SignOptions['expiresIn'],
    // Sans jti, deux tokens émis dans la même seconde seraient identiques,
    // ce qui rendrait la rotation inefficace.
    jwtid: randomUUID(),
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string; role: string }
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string }
}
