import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to={ROUTES.ADMIN} replace />
    if (user.role === 'Lecturer') return <Navigate to={ROUTES.LECTURER} replace />
    if (user.role === 'Student') return <Navigate to={ROUTES.STUDENT} replace />
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <>{children}</>
}
