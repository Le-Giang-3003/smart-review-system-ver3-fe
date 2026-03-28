import { Card, Row, Col, Statistic, Spin, Alert, Table, Empty, Space } from 'antd'
import {
  ScheduleOutlined,
  TeamOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { lecturerApiService } from '@/api/lecturer.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime } from '@/utils/format'
import { isApiSuccess } from '@/types/api'
import type { UpcomingReviewDto } from '@/types/entities'

export const LecturerDashboard = () => {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lecturer-dashboard'],
    queryFn: async () => {
      const res = await lecturerApiService.getDashboard()
      if (!isApiSuccess(res.data)) {
        throw new Error(res.data.message || 'Không thể tải dữ liệu dashboard giảng viên')
      }
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <PageWrapper title="Trang giảng viên">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !data) {
    return (
      <PageWrapper title="Trang giảng viên">
        <Alert
          message="Không thể tải dữ liệu"
          description={
            (error as Error | undefined)?.message ||
            'Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
          }
          type="warning"
          showIcon
        />
      </PageWrapper>
    )
  }

  const {
    lecturerName,
    totalCouncils,
    totalGroupsToReview,
    commentsWritten,
    commentsPending,
    upcomingReviews = [],
  } = data

  const upcomingColumns = [
    {
      title: 'Đợt',
      dataIndex: 'reviewPeriodName',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Giờ',
      render: (_: unknown, r: UpcomingReviewDto) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (r?: string | null) => r || '—' },
  ]

  return (
    <PageWrapper title="Trang giảng viên" subtitle={`Xin chào, ${lecturerName}`}>
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
            <Statistic
              title="Hội đồng tham gia"
              value={totalCouncils}
              prefix={<ScheduleOutlined style={{ color: '#F97316' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #3B82F6' }}>
            <Statistic
              title="Nhóm cần chấm"
              value={totalGroupsToReview}
              prefix={<TeamOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <Statistic
              title="Đã ghi nhận xét"
              value={commentsWritten}
              prefix={<CheckCircleOutlined style={{ color: '#22C55E' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #A855F7' }}>
            <Statistic
              title="Chưa ghi nhận xét"
              value={commentsPending}
              prefix={<EditOutlined style={{ color: '#A855F7' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: '#F97316' }} />
            Lịch review sắp tới
          </Space>
        }
      >
        {upcomingReviews.length > 0 ? (
          <Table
            columns={upcomingColumns}
            dataSource={upcomingReviews}
            rowKey={(r) => `${r.reviewPeriodId}-${r.date}-${r.startTime}`}
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="Chưa có lịch review sắp tới" />
        )}
      </Card>
    </PageWrapper>
  )
}
