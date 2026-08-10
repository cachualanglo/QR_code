/**
 * 🔐 AuthContext — Global auth state management
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getStoredTokens, clearTokens } from '@/lib/api'
import { logout as apiLogout } from '@/services/auth'
import type { UserProfile } from '@/lib/types'

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
        const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]))
        // Check if token is expired
        const expiresAt = payload.exp * 1000
        if (Date.now() < expiresAt) {
          setAuth({
            user: { id: 0, employeeCode: payload.sub, username: payload.sub, role: payload.role || 'EMPLOYEE' },
            isAuthenticated: true,
            isLoading: false,
          })
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
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      setAuth({
        user: {
          id: payload.id || 0,
          employeeCode: payload.sub,
          username: payload.sub,
          role: payload.role || 'EMPLOYEE',
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
