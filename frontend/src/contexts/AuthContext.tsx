/**
 * 🔐 AuthContext — Global auth state management
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getStoredTokens, clearTokens } from '@/lib/api'
import { logout as apiLogout } from '@/services/auth'
import type { UserProfile } from '@/lib/types'

// Robust JWT payload decoder (base64url-safe)
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(json)
  } catch {
    return null
  }
}

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  loginSuccess: (accessToken: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Initialize auth state from stored tokens
  useEffect(() => {
    const tokens = getStoredTokens()
    if (tokens?.accessToken) {
      try {
        const payload = parseJwt(tokens.accessToken)
        // Check if token is expired
        const expiresAt = (payload?.exp ?? 0) * 1000
        if (Date.now() < expiresAt) {
          // If token has a role, initialize user with that role; otherwise treat as invalid
          if (payload?.role) {
            setAuth({
              user: { id: 0, employeeCode: payload?.sub ?? '', username: payload?.sub ?? '', role: payload?.role },
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            clearTokens()
            setAuth({ user: null, isAuthenticated: false, isLoading: false })
          }
          return
        }
      } catch {
        // Invalid token
      }
      clearTokens()
    }
    setAuth({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  const loginSuccess = useCallback((accessToken: string) => {
    try {
      const payload = parseJwt(accessToken)
      // Require role to be present in token; otherwise clear tokens and require re-login
      if (!payload?.role) {
        clearTokens()
        setAuth({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
      setAuth({
        user: {
          id: payload?.id ?? 0,
          employeeCode: payload?.sub ?? '',
          username: payload?.sub ?? '',
          role: payload?.role,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      // Token decode failed
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore logout API errors
    }
    clearTokens()
    setAuth({ user: null, isAuthenticated: false, isLoading: false })
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
