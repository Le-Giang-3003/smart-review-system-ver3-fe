import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Divider } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
  menuItems: MenuProps['items'] | ((navigate: (path: string) => void) => MenuProps['items'])
}

export const MainLayout = ({ children, menuItems }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = typeof menuItems === 'function' ? menuItems(navigate) : menuItems

  useEffect(() => {
    const handler = () => {
      logout()
    }
    window.addEventListener('unauthorized', handler)
    return () => window.removeEventListener('unauthorized', handler)
  }, [logout])

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: logout,
    },
  ]

  const roleLabel =
    user?.role === 'Admin'
      ? 'Quản trị viên'
      : user?.role === 'Lecturer'
        ? 'Giảng viên'
        : 'Sinh viên'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: '1px solid #f0f0f0',
          background: '#fff',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            gap: 12,
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: '#1C1917',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                Smart Review
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: '#A8A29E',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                Hệ thống quản lý
              </Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          style={{
            border: 'none',
            marginTop: 8,
            padding: '0 4px',
          }}
        />

        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              borderTop: '1px solid #f5f5f5',
              background: '#FAFAF9',
            }}
          >
            <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar
                  size={34}
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                    flexShrink: 0,
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      display: 'block',
                      lineHeight: 1.3,
                      color: '#1C1917',
                    }}
                    ellipsis
                  >
                    {user?.fullName || user?.email || 'User'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#A8A29E', display: 'block' }}>
                    {roleLabel}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        )}
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.2s',
          background: '#FFF9F5',
        }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: '#78716C',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF7ED'
                e.currentTarget.style.color = '#F97316'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#78716C'
              }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 18 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 18 }} />
              )}
            </div>
          </div>

          <Space size={16}>
            {collapsed && (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar
                    size={32}
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                    }}
                    icon={<UserOutlined />}
                  />
                </Space>
              </Dropdown>
            )}
          </Space>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <div className="fade-in">{children}</div>
        </Content>

        <Divider style={{ margin: 0 }} />
        <div
          style={{
            textAlign: 'center',
            padding: '12px 24px',
            color: '#A8A29E',
            fontSize: 12,
          }}
        >
          Smart Review System &copy; {new Date().getFullYear()}
        </div>
      </Layout>
    </Layout>
  )
}
