import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Input, Button, message, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { isApiSuccess } from '@/types/api'
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
      if (isApiSuccess(response) && loginData) {
        setAuth(loginData.accessToken, loginData.refreshToken, loginData.user)
        message.success('Đăng nhập thành công')

        if (loginData.user.forceChangePassword) {
          navigate('/profile', { replace: true })
          return
        }

        const redirectPath =
          from ||
          (loginData.user.role === 'Admin'
            ? ROUTES.ADMIN
            : loginData.user.role === 'Lecturer'
              ? ROUTES.LECTURER
              : ROUTES.STUDENT)
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
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,146,60,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 20,
          boxShadow:
            '0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(249,115,22,0.1)',
          padding: '52px 44px',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 68,
              height: 68,
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
              borderRadius: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
            }}
          >
            <svg viewBox="0 0 24 24" width="34" height="34" fill="white">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
            Smart Review System
          </Title>
          <Text style={{ fontSize: 14, color: '#78716C', marginTop: 4, display: 'block' }}>
            Đăng nhập để tiếp tục
          </Text>
        </div>

        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large">
          <Form.Item
            label={<span style={{ fontWeight: 500, color: '#44403C' }}>Email</span>}
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
                  prefix={<MailOutlined style={{ color: '#D6D3D1' }} />}
                  placeholder="Nhập địa chỉ email"
                  autoComplete="email"
                  style={{ height: 48, borderRadius: 10 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 500, color: '#44403C' }}>Mật khẩu</span>}
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
                  prefix={<LockOutlined style={{ color: '#D6D3D1' }} />}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  style={{ height: 48, borderRadius: 10 }}
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
                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button
            type="link"
            style={{ padding: 0, fontSize: 14, color: '#F97316' }}
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
          >
            Quên mật khẩu?
          </Button>
        </div>
      </div>
    </div>
  )
}
