import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function RequireRole({ role, children }: { role: string, children: ReactNode }): JSX.Element {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // Case 1: Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Case 2: Wrong role
  if (!user || user.role !== role) {
    return <Navigate to="/" replace />
  }

  // Case 3: Correct role
  return <>{children}</>
}
