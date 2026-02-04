import { Card, Descriptions, Spin, Tag, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/api/auth.service'
import { PageWrapper } from '@/components/common/PageWrapper'

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'red'
    case 'Lecturer':
      return 'blue'
    case 'Student':
      return 'green'
    default:
      return 'default'
  }
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'Quản trị viên'
    case 'Lecturer':
      return 'Giảng viên'
    case 'Student':
      return 'Sinh viên'
    default:
      return role
  }
}

export const ProfilePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await authService.getMe()
      return res.data
    },
  })

  if (isLoading) {
    return (
      <PageWrapper title="Hồ sơ cá nhân">
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Hồ sơ cá nhân">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <div>
            <h2 style={{ margin: 0, marginBottom: 8 }}>{data?.fullName}</h2>
            <Tag color={getRoleColor(data?.role || '')}>{getRoleLabel(data?.role || '')}</Tag>
          </div>
        </div>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Họ và tên">{data?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{data?.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={getRoleColor(data?.role || '')}>{getRoleLabel(data?.role || '')}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageWrapper>
  )
}
