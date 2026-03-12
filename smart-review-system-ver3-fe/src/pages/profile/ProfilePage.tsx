import { Card, Descriptions, Spin, Tag, Avatar, Button, Modal, Form, Input, App, Space } from 'antd'
import { UserOutlined, ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '@/api/auth.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { useAuth } from '@/hooks/useAuth'

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
  const navigate = useNavigate()
  const { user } = useAuth()
  const { message } = App.useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await authService.getMe()
      return res.data
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (res) => {
      if (res.isSuccess) {
        message.success('Đổi mật khẩu thành công')
        setIsModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.message || 'Thay đổi mật khẩu thất bại')
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Thay đổi mật khẩu thất bại')
    }
  })

  const getBackPath = () => {
    switch (user?.role) {
      case 'Admin':
        return '/admin'
      case 'Lecturer':
        return '/lecturer'
      case 'Student':
        return '/student'
      default:
        return '/'
    }
  }

  const backButton = (
    <Button
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(getBackPath())}
    >
      Quay lại
    </Button>
  )

  const handlePasswordSubmit = () => {
    form.validateFields().then((values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp')
        return
      }
      changePasswordMutation.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
    })
  }

  if (isLoading) {
    return (
      <PageWrapper title="Hồ sơ cá nhân" extra={backButton}>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Hồ sơ cá nhân" extra={
      <Space>
        {backButton}
        <Button 
          type="primary" 
          icon={<KeyOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          Đổi mật khẩu
        </Button>
      </Space>
    }>
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

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handlePasswordSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}>
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}>
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>
                Cập nhật
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
