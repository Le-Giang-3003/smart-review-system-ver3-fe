import { Typography } from 'antd'

const { Title } = Typography

interface PageWrapperProps {
  title: string
  subtitle?: string
  extra?: React.ReactNode
  children: React.ReactNode
}

export const PageWrapper = ({ title, subtitle, extra, children }: PageWrapperProps) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
            {title}
          </Title>
          {subtitle && (
            <span style={{ color: '#78716C', fontSize: 14, marginTop: 4, display: 'block' }}>
              {subtitle}
            </span>
          )}
        </div>
        {extra}
      </div>
      {children}
    </div>
  )
}
