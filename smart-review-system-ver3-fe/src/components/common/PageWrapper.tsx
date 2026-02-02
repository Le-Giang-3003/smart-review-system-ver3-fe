import { Typography } from 'antd'

const { Title } = Typography

interface PageWrapperProps {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
}

export const PageWrapper = ({ title, extra, children }: PageWrapperProps) => {
  return (
    <div style={{ padding: '0 4px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {title}
        </Title>
        {extra}
      </div>
      {children}
    </div>
  )
}
