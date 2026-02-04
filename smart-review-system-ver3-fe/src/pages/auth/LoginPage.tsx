import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Input, Button, message, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants'

const { Title, Text } = Typography

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const loginData = response.data
      if (response.isSuccess && loginData) {
        setAuth(loginData.token, loginData.user)
        message.success('Đăng nhập thành công')
        const redirectPath = from || (loginData.user.role === 'Admin' ? ROUTES.ADMIN : loginData.user.role === 'Lecturer' ? ROUTES.LECTURER : ROUTES.STUDENT)
        navigate(redirectPath, { replace: true })
      } else {
        message.error(response.message || 'Đăng nhập thất bại')
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại')
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
          padding: '48px 40px',
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              borderRadius: 16,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="white"
            >
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>
            Smart Review System
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Đăng nhập để tiếp tục
          </Text>
        </div>

        {/* Form */}
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large">
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>Email</span>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
            style={{ marginBottom: 20 }}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Nhập địa chỉ email"
                  autoComplete="email"
                  style={{
                    height: 48,
                    borderRadius: 10,
                  }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
            style={{ marginBottom: 28 }}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  style={{
                    height: 48,
                    borderRadius: 10,
                  }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loginMutation.isPending}
              block
              style={{
                height: 48,
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* Demo credentials */}
        <div
          style={{
            textAlign: 'center',
            padding: '12px 16px',
            background: '#f6f8fa',
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo: <Text code style={{ fontSize: 11 }}>admin@test.com</Text> / <Text code style={{ fontSize: 11 }}>123456</Text>
          </Text>
        </div>
      </div>
    </div>
  )
}
