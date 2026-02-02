import { Card, Row, Col, Statistic, Empty } from 'antd'
import { PageWrapper } from '@/components/common/PageWrapper'
import { ScheduleOutlined, FileTextOutlined } from '@ant-design/icons'

export const LecturerDashboard = () => {
  return (
    <PageWrapper title="Trang giảng viên">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Slot đã đăng ký" value={0} prefix={<ScheduleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Phiên review được phân" value={0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <Empty description="API giảng viên chưa được triển khai. Vui lòng kết nối backend khi có sẵn." />
      </Card>
    </PageWrapper>
  )
}
