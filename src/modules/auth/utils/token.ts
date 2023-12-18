import type { IToken } from '@/types/app'

export const isTokenExpired = (token: IToken | undefined | null): null | boolean => {
  if (!token) return null
  if (!token.expiresIn) return true

  return new Date(token.expiresIn) < new Date()
}
