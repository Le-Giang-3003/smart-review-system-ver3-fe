import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import { appTheme } from '@/styles/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/pages/auth/LoginPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { SemestersPage } from '@/pages/admin/SemestersPage'
import { ReviewPeriodsPage } from '@/pages/admin/ReviewPeriodsPage'
import { ReviewSlotsPage } from '@/pages/admin/ReviewSlotsPage'
import { TopicsPage } from '@/pages/admin/TopicsPage'
import { TagsPage } from '@/pages/admin/TagsPage'
import { LecturersPage } from '@/pages/admin/LecturersPage'
import { ReviewSessionsPage } from '@/pages/admin/ReviewSessionsPage'
import { SchedulingPage } from '@/pages/admin/SchedulingPage'
import { LecturerDashboard } from '@/pages/lecturer/LecturerDashboard'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import type { MenuProps } from 'antd'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const getAdminMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  { key: '/admin', icon: null, label: 'Tổng quan', onClick: () => navigate('/admin') },
  { key: '/admin/semesters', icon: null, label: 'Học kỳ', onClick: () => navigate('/admin/semesters') },
  { key: '/admin/review-periods', icon: null, label: 'Đợt review', onClick: () => navigate('/admin/review-periods') },
  { key: '/admin/review-slots', icon: null, label: 'Slot review', onClick: () => navigate('/admin/review-slots') },
  { key: '/admin/topics', icon: null, label: 'Đề tài', onClick: () => navigate('/admin/topics') },
  { key: '/admin/tags', icon: null, label: 'Tags', onClick: () => navigate('/admin/tags') },
  { key: '/admin/lecturers', icon: null, label: 'Giảng viên', onClick: () => navigate('/admin/lecturers') },
  { key: '/admin/review-sessions', icon: null, label: 'Phiên review', onClick: () => navigate('/admin/review-sessions') },
  { key: '/admin/scheduling', icon: null, label: 'Thuật toán lên lịch', onClick: () => navigate('/admin/scheduling') },
]

const getLecturerMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  { key: '/lecturer', icon: null, label: 'Tổng quan', onClick: () => navigate('/lecturer') },
]

const getStudentMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  { key: '/student', icon: null, label: 'Tổng quan', onClick: () => navigate('/student') },
]

const ProfileWithLayout = () => {
  const user = useAuthStore((state) => state.user)

  const getMenuItems = () => {
    switch (user?.role) {
      case 'Admin':
        return getAdminMenuItems
      case 'Lecturer':
        return getLecturerMenuItems
      case 'Student':
        return getStudentMenuItems
      default:
        return getStudentMenuItems
    }
  }

  return (
    <MainLayout menuItems={getMenuItems()}>
      <ProfilePage />
    </MainLayout>
  )
}

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <MainLayout menuItems={getAdminMenuItems}>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="semesters" element={<SemestersPage />} />
              <Route path="review-periods" element={<ReviewPeriodsPage />} />
              <Route path="review-slots" element={<ReviewSlotsPage />} />
              <Route path="topics" element={<TopicsPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="lecturers" element={<LecturersPage />} />
              <Route path="review-sessions" element={<ReviewSessionsPage />} />
              <Route path="scheduling" element={<SchedulingPage />} />
            </Route>
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={['Lecturer']}>
                  <MainLayout menuItems={getLecturerMenuItems}>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }
            >
              <Route index element={<LecturerDashboard />} />
            </Route>
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MainLayout menuItems={getStudentMenuItems}>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
            </Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Lecturer', 'Student']}>
                  <ProfileWithLayout />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
