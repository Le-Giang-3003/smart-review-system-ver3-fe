import { Card, Row, Col, Statistic, Spin, Alert, Table, Tag, Progress } from 'antd'
import { useQuery } from '@tanstack/react-query'
import {
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { dashboardService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatReviewPeriodStatus, formatReviewRound, reviewPeriodStatusColor } from '@/utils/format'

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
    workloadDistribution,
    slotFillRate,
  } = dashboardData

  const reviewPeriodColumns = [
    { title: 'Tên đợt', dataIndex: 'name' },
    {
      title: 'Vòng',
      dataIndex: 'round',
      render: (r: string | number) => formatReviewRound(r),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string | number) => (
        <Tag color={reviewPeriodStatusColor(s)}>
          {formatReviewPeriodStatus(s)}
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

      {workloadDistribution && (
        <Card
          title={
            <span>
              <PieChartOutlined style={{ color: '#0D9488', marginRight: 8 }} />
              Phân bổ tải giảng viên (theo đề tài min–max)
            </span>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Statistic title="Đang ở mức tối thiểu" value={workloadDistribution.lecturersAtMin} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Trong khoảng" value={workloadDistribution.lecturersBetween} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Gần tối đa" value={workloadDistribution.lecturersNearMax} />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic title="Vượt tải" value={workloadDistribution.lecturersOverMax} valueStyle={{ color: '#ef4444' }} />
            </Col>
          </Row>
        </Card>
      )}

      {typeof slotFillRate === 'number' && (
        <Card title="Tỷ lệ lấp đầy slot review" style={{ marginBottom: 20 }}>
          <Progress
            percent={Math.round(slotFillRate * 100)}
            status="active"
            format={(p) => `${p}%`}
          />
        </Card>
      )}

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
