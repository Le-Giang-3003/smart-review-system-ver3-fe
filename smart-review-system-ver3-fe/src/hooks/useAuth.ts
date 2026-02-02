import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'

export const useAuth = () => {
  const { token, user, setAuth, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return {
    token,
    user,
    setAuth,
    logout: handleLogout,
    isAuthenticated: isAuthenticated(),
    isAdmin: user?.role === 'Admin',
    isLecturer: user?.role === 'Lecturer',
    isStudent: user?.role === 'Student',
  }
}
