import { Card, Row, Col, Statistic, Spin, Alert, Table } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { FileTextOutlined, TeamOutlined } from '@ant-design/icons'
import { dashboardService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'

export const AdminDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await dashboardService.getAdminDashboard()
      return res.data.data
    },
  })

  if (isLoading) {
    return (
      <PageWrapper title="Tổng quan">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !dashboardData) {
    return (
       <PageWrapper title="Tổng quan">
         <Alert message="Lỗi" description="Không thể tải dữ liệu dashboard." type="error" showIcon />
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
    { title: 'Vòng', dataIndex: 'round' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Số slot', dataIndex: 'slotCount' },
  ]

  return (
    <PageWrapper title="Tổng quan">
      {activeSemester && (
        <Alert
           message={`Học kỳ hiện tại: ${activeSemester.code} - ${activeSemester.name}`}
           type="info"
           showIcon
           style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={totalLecturers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sinh viên"
              value={totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhóm"
              value={totalGroups}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đề tài"
              value={totalTopics}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Các đợt review" style={{ marginTop: 24 }}>
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

