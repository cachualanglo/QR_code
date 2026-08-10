/**
 * 🔐 Auth Service — Login / Refresh / Logout
 */
import { api, storeTokens, clearTokens, getStoredTokens } from '@/lib/api'
import type { LoginRequest, LoginResponse, MessageResponse } from '@/lib/types'

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>('/auth/login', { username, password } as LoginRequest)
  storeTokens(data)
  return data
}

export async function refreshToken(): Promise<LoginResponse> {
  const tokens = getStoredTokens()
  if (!tokens?.refreshToken) throw new Error('No refresh token')

  const data = await api.post<LoginResponse>('/auth/refresh', {
    refreshToken: tokens.refreshToken,
  })
  storeTokens(data)
  return data
}

export async function logout(): Promise<MessageResponse> {
  const tokens = getStoredTokens()
  try {
    const data = await api.post<MessageResponse>('/auth/logout', {
      refreshToken: tokens?.refreshToken,
    })
    return data
  } finally {
    clearTokens()
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredTokens()?.accessToken
}

export function getStoredUser(): { username: string } | null {
  const tokens = getStoredTokens()
  if (!tokens?.accessToken) return null

  try {
    // Decode JWT payload (base64url)
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]))
    return { username: payload.sub }
  } catch {
    return null
  }
}
