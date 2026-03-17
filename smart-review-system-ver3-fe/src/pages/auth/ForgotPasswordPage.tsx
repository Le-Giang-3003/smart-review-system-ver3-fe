import { useState } from 'react'
import { Form, Input, Button, Typography, message, Result } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api/auth.service'
import { isApiSuccess } from '@/types/api'
import { ROUTES } from '@/constants'

const { Title, Text } = Typography

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  const [form] = Form.useForm()

  const resetMutation = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: (response) => {
      if (isApiSuccess(response)) {
        setSent(true)
      } else {
        message.error(response.message || 'Gửi yêu cầu thất bại')
      }
    },
    onError: () => {
      setSent(true)
    },
  })

  const onSubmit = (values: { email: string }) => {
    resetMutation.mutate({ email: values.email })
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
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(249,115,22,0.1)',
          padding: '52px 44px',
        }}
      >
        {sent ? (
          <Result
            status="success"
            title="Email đã được gửi"
            subTitle="Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTES.LOGIN)}>
                Quay lại đăng nhập
              </Button>
            }
          />
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
                <MailOutlined style={{ fontSize: 30, color: '#fff' }} />
              </div>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Quên mật khẩu
              </Title>
              <Text style={{ fontSize: 14, color: '#78716C', marginTop: 4, display: 'block' }}>
                Nhập email để nhận hướng dẫn đặt lại mật khẩu
              </Text>
            </div>

            <Form form={form} layout="vertical" onFinish={onSubmit} size="large">
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 500, color: '#44403C' }}>Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#D6D3D1' }} />}
                  placeholder="Nhập email đã đăng ký"
                  style={{ height: 48, borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={resetMutation.isPending}
                  block
                  style={{
                    height: 48,
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                  }}
                >
                  Gửi yêu cầu
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(ROUTES.LOGIN)}
                style={{ color: '#F97316' }}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
