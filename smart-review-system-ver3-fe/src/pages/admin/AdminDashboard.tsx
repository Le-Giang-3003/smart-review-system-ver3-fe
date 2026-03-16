import { Card, Row, Col, Statistic, Spin, Alert, Table, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import {
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { dashboardService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { PERIOD_STATUS_LABELS, PERIOD_STATUS_COLORS, REVIEW_ROUND_LABELS } from '@/constants'

export const AdminDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await dashboardService.getAdminDashboard()
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <PageWrapper title="Tổng quan">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !dashboardData) {
    return (
      <PageWrapper title="Tổng quan">
        <Alert
          message="Lỗi"
          description="Không thể tải dữ liệu dashboard."
          type="error"
          showIcon
        />
      </PageWrapper>
    )
  }

  const {
    totalLecturers,
    totalStudents,
    totalGroups,
    totalTopics,
    activeSemester,
    reviewPeriods = [],
  } = dashboardData

  const reviewPeriodColumns = [
    { title: 'Tên đợt', dataIndex: 'name' },
    {
      title: 'Vòng',
      dataIndex: 'round',
      render: (r: number) => REVIEW_ROUND_LABELS[r] ?? `Vòng ${r}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: number) => (
        <Tag color={PERIOD_STATUS_COLORS[s] || 'default'}>
          {PERIOD_STATUS_LABELS[s] ?? s}
        </Tag>
      ),
    },
    { title: 'Số slot', dataIndex: 'slotCount' },
  ]

  return (
    <PageWrapper
      title="Tổng quan"
      subtitle={
        activeSemester
          ? `Học kỳ hiện tại: ${activeSemester.code} - ${activeSemester.name}`
          : undefined
      }
    >
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
            <Statistic
              title="Giảng viên"
              value={totalLecturers}
              prefix={<TeamOutlined style={{ color: '#F97316' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #3B82F6' }}>
            <Statistic
              title="Sinh viên"
              value={totalStudents}
              prefix={<TeamOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <Statistic
              title="Nhóm"
              value={totalGroups}
              prefix={<BookOutlined style={{ color: '#22C55E' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #A855F7' }}>
            <Statistic
              title="Đề tài"
              value={totalTopics}
              prefix={<FileTextOutlined style={{ color: '#A855F7' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span>
            <CalendarOutlined style={{ color: '#F97316', marginRight: 8 }} />
            Các đợt review
          </span>
        }
      >
        <Table
          columns={reviewPeriodColumns}
          dataSource={reviewPeriods}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </PageWrapper>
  )
}
