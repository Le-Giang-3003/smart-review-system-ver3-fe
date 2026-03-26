import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { appTheme } from '@/styles/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { SemestersPage } from '@/pages/admin/SemestersPage'
import { ReviewPeriodsPage } from '@/pages/admin/ReviewPeriodsPage'
import { ReviewSlotsPage } from '@/pages/admin/ReviewSlotsPage'
import { TopicsPage } from '@/pages/admin/TopicsPage'
import { LecturersPage } from '@/pages/admin/LecturersPage'
import { StudentsPage } from '@/pages/admin/StudentsPage'
import { GroupsPage } from '@/pages/admin/GroupsPage'
import { ReviewSessionsPage } from '@/pages/admin/ReviewSessionsPage'
import { SchedulingPage } from '@/pages/admin/SchedulingPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { LecturerDashboard } from '@/pages/lecturer/LecturerDashboard'
import { LecturerSlotsPage } from '@/pages/lecturer/LecturerSlotsPage'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { StudentGroupPage } from '@/pages/student/StudentGroupPage'
import { StudentTopicsPage } from '@/pages/student/StudentTopicsPage'
import { StudentSlotsPage } from '@/pages/student/StudentSlotsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/stores/authStore'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TeamOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
  UserOutlined,
  ScheduleOutlined,
  BookOutlined,
  AuditOutlined,
} from '@ant-design/icons'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const getAdminMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  {
    type: 'group',
    label: 'TỔNG QUAN',
    children: [
      {
        key: '/admin',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => navigate('/admin'),
      },
    ],
  },
  {
    type: 'group',
    label: 'QUẢN LÝ DỮ LIỆU',
    children: [
      {
        key: '/admin/semesters',
        icon: <CalendarOutlined />,
        label: 'Học kỳ',
        onClick: () => navigate('/admin/semesters'),
      },
      {
        key: '/admin/lecturers',
        icon: <SolutionOutlined />,
        label: 'Giảng viên',
        onClick: () => navigate('/admin/lecturers'),
      },
      {
        key: '/admin/students',
        icon: <TeamOutlined />,
        label: 'Sinh viên',
        onClick: () => navigate('/admin/students'),
      },
      {
        key: '/admin/groups',
        icon: <ApartmentOutlined />,
        label: 'Nhóm',
        onClick: () => navigate('/admin/groups'),
      },
      {
        key: '/admin/topics',
        icon: <FileTextOutlined />,
        label: 'Đề tài',
        onClick: () => navigate('/admin/topics'),
      },
    ],
  },
  {
    type: 'group',
    label: 'LÊN LỊCH REVIEW',
    children: [
      {
        key: '/admin/review-periods',
        icon: <ClockCircleOutlined />,
        label: 'Đợt review',
        onClick: () => navigate('/admin/review-periods'),
      },
      {
        key: '/admin/review-slots',
        icon: <FieldTimeOutlined />,
        label: 'Slot review',
        onClick: () => navigate('/admin/review-slots'),
      },
      {
        key: '/admin/scheduling',
        icon: <ThunderboltOutlined />,
        label: 'Lên lịch',
        onClick: () => navigate('/admin/scheduling'),
      },
      {
        key: '/admin/review-sessions',
        icon: <AuditOutlined />,
        label: 'Hội đồng',
        onClick: () => navigate('/admin/review-sessions'),
      },
    ],
  },
  {
    type: 'group',
    label: 'HỆ THỐNG',
    children: [
      {
        key: '/admin/users',
        icon: <UserOutlined />,
        label: 'Tài khoản',
        onClick: () => navigate('/admin/users'),
      },
    ],
  },
]

const getLecturerMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  {
    key: '/lecturer',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
    onClick: () => navigate('/lecturer'),
  },
  {
    key: '/lecturer/slots',
    icon: <ScheduleOutlined />,
    label: 'Đăng ký slot',
    onClick: () => navigate('/lecturer/slots'),
  },
]

const getStudentMenuItems = (navigate: (path: string) => void): MenuProps['items'] => [
  {
    key: '/student',
    icon: <DashboardOutlined />,
    label: 'Tổng quan',
    onClick: () => navigate('/student'),
  },
  {
    key: '/student/group',
    icon: <TeamOutlined />,
    label: 'Nhóm của tôi',
    onClick: () => navigate('/student/group'),
  },
  {
    key: '/student/topics',
    icon: <BookOutlined />,
    label: 'Đề tài',
    onClick: () => navigate('/student/topics'),
  },
  {
    key: '/student/slots',
    icon: <ScheduleOutlined />,
    label: 'Đăng ký slot',
    onClick: () => navigate('/student/slots'),
  },
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
    <ConfigProvider theme={appTheme} locale={viVN}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

              {/* Admin routes */}
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
                <Route path="lecturers" element={<LecturersPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="review-sessions" element={<ReviewSessionsPage />} />
                <Route path="scheduling" element={<SchedulingPage />} />
              </Route>

              {/* Lecturer routes */}
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
                <Route path="slots" element={<LecturerSlotsPage />} />
              </Route>

              {/* Student routes */}
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
                <Route path="group" element={<StudentGroupPage />} />
                <Route path="topics" element={<StudentTopicsPage />} />
                <Route path="slots" element={<StudentSlotsPage />} />
              </Route>

              {/* Profile */}
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
