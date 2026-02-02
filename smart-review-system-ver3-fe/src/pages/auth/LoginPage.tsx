import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants'

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
            Smart Review System
          </div>
        }
        style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large">
          <Form.Item
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  autoComplete="email"
                />
              )}
            />
          </Form.Item>
          <Form.Item
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  autoComplete="current-password"
                />
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loginMutation.isPending}
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>
          Demo: admin@test.com / 123456
        </div>
      </Card>
    </div>
  )
}
