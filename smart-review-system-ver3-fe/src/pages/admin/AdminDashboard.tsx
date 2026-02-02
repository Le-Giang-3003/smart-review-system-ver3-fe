import { Card, Row, Col, Statistic } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { CalendarOutlined, FileTextOutlined, TeamOutlined, ScheduleOutlined } from '@ant-design/icons'
import { semesterService, reviewPeriodService, topicService, lecturerService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'

export const AdminDashboard = () => {
  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: periods } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await topicService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: lecturers } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await lecturerService.getAll()
      return res.data.data ?? []
    },
  })

  return (
    <PageWrapper title="Tổng quan">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Học kỳ"
              value={semesters?.length ?? 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đợt review"
              value={periods?.length ?? 0}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đề tài"
              value={topics?.length ?? 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={lecturers?.length ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </PageWrapper>
  )
}
