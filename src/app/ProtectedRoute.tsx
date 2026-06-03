import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

/** Sólo deja pasar si hay sesión; si no, manda al login. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth()
  return isAuthed ? <>{children}</> : <Navigate to="/" replace />
}

/** Sólo para invitados; si ya hay sesión, manda al chat. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth()
  return isAuthed ? <Navigate to="/chat" replace /> : <>{children}</>
}
