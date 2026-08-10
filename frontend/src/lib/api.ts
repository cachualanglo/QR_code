/**
 * 🔌 API Client — Fetch wrapper with JWT management
 * Tự động attach Authorization header, auto-refresh token khi hết hạn
 */

// ─── Config ─────────────────────────────────────────────
const BASE_URL = '/api'

// ─── Token Storage (localStorage) ───────────────────────
const TOKEN_KEY = 'attendance_tokens'

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number // seconds
}

export function getStoredTokens(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeTokens(tokens: TokenPair): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── API Error ──────────────────────────────────────────
export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// ─── Token Refresh Logic ────────────────────────────────
let refreshPromise: Promise<TokenPair> | null = null

async function refreshAccessToken(): Promise<TokenPair> {
  const tokens = getStoredTokens()
  if (!tokens?.refreshToken) throw new ApiError(401, 'No refresh token')

  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!res.ok) throw new ApiError(res.status, 'Refresh failed')

      const data = await res.json()
      const newTokens: TokenPair = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      }
      storeTokens(newTokens)
      return newTokens
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ─── Core Request Function ──────────────────────────────
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = getStoredTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  // Attach JWT if available
  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Handle 401 → try refresh once
  if (res.status === 401 && tokens?.refreshToken) {
    try {
      const newTokens = await refreshAccessToken()
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      })

      if (!retryRes.ok) {
        const errorBody = await retryRes.json().catch(() => ({}))
        throw new ApiError(
          retryRes.status,
          errorBody.message || `Request failed: ${retryRes.status}`,
          errorBody.code
        )
      }

      return retryRes.json()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens()
        window.location.href = '/login'
      }
      throw err
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      errorBody.message || `Request failed: ${res.status}`,
      errorBody.code
    )
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

// ─── Convenience Methods ────────────────────────────────
export const api = {
  get: <T>(path: string) => apiRequest<T>(path),

  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}
