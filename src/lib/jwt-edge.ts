import { jwtVerify } from 'jose'

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function verifyAccessTokenEdge(
  token: string
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload as { userId: string; role: string }
  } catch {
    return null
  }
}