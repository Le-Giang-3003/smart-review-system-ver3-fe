import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tag,
  Empty,
  Space,
  List,
} from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime, normalizeReviewPeriodStatusKey } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import type { ReviewPeriod, Semester, UpcomingReviewDto } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'
import { isApiSuccess } from '@/types/api'

export const StudentDashboard = () => {
  const { user } = useAuth()

  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await studentApiService.getDashboard()
      return res.data.data
    },
  })

  const { data: registeredPrefPeriodNames = [] } = useQuery({
    queryKey: ['student-slot-pref-status'],
    queryFn: async () => {
      const semRes = await semesterService.getAll()
      const semesters = (semRes.data.data ?? []).filter((s: Semester) => s.isActive)
      const names: string[] = []
      for (const sem of semesters) {
        const res = await reviewPeriodService.getBySemester(sem.id)
        const periods = extractListFromApiData<ReviewPeriod>(res.data?.data)
        const openPeriods = periods.filter(
          (p) => normalizeReviewPeriodStatusKey(p.status) === 'Open'
        )
        for (const p of openPeriods) {
          try {
            const prefRes = await studentApiService.getMyGroupPreferences(p.id)
            const env = prefRes.data
            if (isApiSuccess(env) && env.data?.preferences?.length === 5) {
              names.push(p.name)
            }
          } catch {
            /* không trong nhóm hoặc lỗi — bỏ qua */
          }
        }
      }
      return names
    },
    enabled: !!dashboard?.groupName,
  })

  if (isLoading) {
    return (
      <PageWrapper title="Trang sinh viên">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !dashboard) {
    return (
      <PageWrapper title="Trang sinh viên">
        <Alert
          message="Không thể tải dữ liệu"
          description="Vui lòng thử lại sau hoặc liên hệ quản trị viên."
          type="warning"
          showIcon
        />
      </PageWrapper>
    )
  }

  const { studentName, groupName, topicCode, topicTitle, upcomingReviews = [] } = dashboard

  const displayName = studentName || user?.fullName || user?.email

  return (
    <PageWrapper title="Trang sinh viên" subtitle={displayName ? `Xin chào, ${displayName}` : undefined}>
      {registeredPrefPeriodNames.length > 0 ? (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Nhóm đã đăng ký đủ 5 slot ưu tiên review"
          description={`Đợt: ${registeredPrefPeriodNames.join(', ')}`}
          style={{ marginBottom: 24 }}
        />
      ) : null}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
            <Statistic
              title="Nhóm"
              value={groupName ?? 'Chưa có'}
              prefix={<TeamOutlined style={{ color: '#F97316' }} />}
              valueStyle={{ fontSize: groupName ? 28 : 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" style={{ borderTop: '3px solid #3B82F6' }}>
            <Statistic
              title="Đề tài"
              value={topicTitle || topicCode ? 1 : 0}
              prefix={<FileTextOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <Statistic
              title="Buổi review sắp tới"
              value={upcomingReviews.length}
              prefix={<CalendarOutlined style={{ color: '#22C55E' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="Nhóm & đề tài">
            {!groupName ? (
              <Empty description="Bạn chưa được gán nhóm" />
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Nhóm:</strong> {groupName}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Đề tài:</strong> {topicTitle || topicCode || '—'}
                </div>
                {topicCode && (
                  <Tag color="orange" style={{ marginTop: 8 }}>
                    {topicCode}
                  </Tag>
                )}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Lịch review sắp tới">
            {upcomingReviews.length === 0 ? (
              <Empty description="Chưa có lịch" />
            ) : (
              <List
                dataSource={upcomingReviews}
                renderItem={(item: UpcomingReviewDto) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CalendarOutlined style={{ fontSize: 20, color: '#F97316' }} />}
                      title={`${item.reviewPeriodName}`}
                      description={
                        <Space direction="vertical" size={0}>
                          <span>
                            {formatDate(item.date)} | {formatTime(item.startTime)} – {formatTime(item.endTime)}
                          </span>
                          <span>{item.room ? `Phòng: ${item.room}` : ''}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageWrapper>
  )
}
