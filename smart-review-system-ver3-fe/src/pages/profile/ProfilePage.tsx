import { Card, Descriptions, Spin, Tag, Avatar, Button, Modal, Form, Input, App, Space } from 'antd'
import { UserOutlined, ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { authService } from '@/api/auth.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS, ROLE_COLORS } from '@/constants'

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
    },
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

  const handlePasswordSubmit = () => {
    form.validateFields().then((values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp')
        return
      }
      changePasswordMutation.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    })
  }

  if (isLoading) {
    return (
      <PageWrapper title="Hồ sơ cá nhân">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper
      title="Hồ sơ cá nhân"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(getBackPath())}>
            Quay lại
          </Button>
          <Button
            type="primary"
            icon={<KeyOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Đổi mật khẩu
          </Button>
        </Space>
      }
    >
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
              boxShadow: '0 4px 14px rgba(249,115,22,0.25)',
            }}
          />
          <div>
            <h2 style={{ margin: 0, marginBottom: 8, color: '#1C1917' }}>
              {data?.fullName || data?.email}
            </h2>
            <Tag color={ROLE_COLORS[data?.role || ''] || 'default'}>
              {ROLE_LABELS[data?.role || ''] || data?.role}
            </Tag>
          </div>
        </div>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Họ và tên">{data?.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{data?.email}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Tag color={ROLE_COLORS[data?.role || ''] || 'default'}>
              {ROLE_LABELS[data?.role || ''] || data?.role}
            </Tag>
          </Descriptions.Item>
          {data?.lecturerCode && (
            <Descriptions.Item label="Mã giảng viên">{data.lecturerCode}</Descriptions.Item>
          )}
          {data?.studentCode && (
            <Descriptions.Item label="Mã sinh viên">{data.studentCode}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={changePasswordMutation.isPending}
              >
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
