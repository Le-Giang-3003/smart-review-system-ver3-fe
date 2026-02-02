import { Card, Row, Col, Statistic, Empty } from 'antd'
import { PageWrapper } from '@/components/common/PageWrapper'
import { TeamOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons'

export const StudentDashboard = () => {
  return (
    <PageWrapper title="Trang sinh viên">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Nhóm của tôi" value={0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Đề tài đã đăng ký" value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Phiên review" value={0} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <Empty description="API sinh viên chưa được triển khai. Vui lòng kết nối backend khi có sẵn." />
      </Card>
    </PageWrapper>
  )
}
