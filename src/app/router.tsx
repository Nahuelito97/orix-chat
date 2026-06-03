import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthListener } from '../features/auth/hooks/useAuthListener'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useApplyTheme } from '../features/settings/hooks/useApplyTheme'
import Spinner from '../components/ui/Spinner'
import { ProtectedRoute, GuestRoute } from './ProtectedRoute'
import LoginPage from '../features/auth/pages/LoginPage'
import ChatPage from '../features/chat/pages/ChatPage'
import ProfilePage from '../features/profile/pages/ProfilePage'

export default function AppRouter() {
  useAuthListener()
  useApplyTheme()
  const { ready } = useAuth()

  if (!ready) return <Spinner />

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
