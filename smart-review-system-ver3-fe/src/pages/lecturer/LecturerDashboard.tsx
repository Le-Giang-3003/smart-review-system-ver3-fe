import { Card, Row, Col, Statistic, Spin, Alert, Table, Tag, Empty, Space } from 'antd'
import {
  ScheduleOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { lecturerApiService } from '@/api/lecturer.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime } from '@/utils/format'
import { isApiSuccess } from '@/types/api'

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
        // Surface API error so UI can show proper message
        throw new Error(res.data.message || 'Không thể tải dữ liệu dashboard giảng viên')
      }
      return res.data.data
    },
  })

  const dashboard = data

  if (isLoading) {
    return (
      <PageWrapper title="Trang giảng viên">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !dashboard) {
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

  const { lecturerInfo, registeredSlots = [], councilAssignments = [], totalAssignedGroups, totalRegisteredSlots } = dashboard
  const now = new Date()
  const assignedSlots = [...councilAssignments]
  const upcomingAssignedSlots = assignedSlots.filter((item: { date: string; endTime: string }) => {
    const endAt = new Date(`${item.date}T${item.endTime}`)
    return !Number.isNaN(endAt.getTime()) && endAt >= now
  })
  const chairmanCount = assignedSlots.filter(
    (item: { members: { lecturerId: number; isChairman: boolean }[] }) =>
      item.members?.some((m) => m.lecturerId === lecturerInfo?.id && m.isChairman),
  ).length

  const slotColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: { startTime: string; endTime: string }) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room?: string) => room || <Tag color="default">Chưa xếp</Tag>,
    },
    {
      title: 'Nhóm tối đa',
      dataIndex: 'maxGroups',
      align: 'center' as const,
    },
  ]

  const assignedColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: { startTime: string; endTime: string }) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room?: string) => room || '-',
    },
    {
      title: 'Vai trò',
      dataIndex: 'members',
      render: (members: { lecturerId: number; isChairman: boolean }[]) => {
        const me = members?.find((m) => m.lecturerId === lecturerInfo?.id)
        return me?.isChairman ? (
          <Tag color="volcano">Chủ tịch HĐ</Tag>
        ) : (
          <Tag color="blue">Thành viên</Tag>
        )
      },
    },
    {
      title: 'Số nhóm',
      dataIndex: 'groups',
      align: 'center' as const,
      render: (groups: { groupName: string }[]) => groups?.length ?? 0,
    },
    {
      title: 'Nhóm review',
      dataIndex: 'groups',
      render: (groups: { groupName: string; topicTitle?: string }[]) =>
        groups?.length
          ? groups.map((g) => (g.topicTitle ? `${g.groupName} (${g.topicTitle})` : g.groupName)).join(', ')
          : '-',
    },
  ]

  return (
    <PageWrapper
      title="Trang giảng viên"
      subtitle={lecturerInfo ? `Xin chào, ${lecturerInfo.fullName}` : undefined}
    >
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
            <Statistic
              title="Slot đã đăng ký"
              value={totalRegisteredSlots ?? registeredSlots.length}
              prefix={<ScheduleOutlined style={{ color: '#F97316' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #3B82F6' }}>
            <Statistic
              title="Nhóm được phân"
              value={totalAssignedGroups ?? 0}
              prefix={<TeamOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <Statistic
              title="Slot được phân công"
              value={assignedSlots.length}
              prefix={<CalendarOutlined style={{ color: '#22C55E' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #A855F7' }}>
            <Statistic
              title="Chuyên môn"
              value={lecturerInfo?.expertises?.length ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#A855F7' }} />}
              suffix="lĩnh vực"
            />
          </Card>
        </Col>
      </Row>

      {lecturerInfo?.expertises && lecturerInfo.expertises.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#44403C' }}>
            Chuyên môn của bạn
          </div>
          <Space wrap>
            {lecturerInfo.expertises.map((exp: string, idx: number) => (
              <Tag key={idx} color="orange">
                {exp}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      <Card
        title="Lịch review được phân công (sắp tới)"
        style={{ marginBottom: 20 }}
        extra={
          <Space size={8}>
            <Tag color="green">Sắp tới: {upcomingAssignedSlots.length}</Tag>
            <Tag color="volcano">Vai trò Chủ tịch: {chairmanCount}</Tag>
          </Space>
        }
      >
        {upcomingAssignedSlots.length > 0 ? (
          <Table
            columns={assignedColumns}
            dataSource={upcomingAssignedSlots}
            rowKey="councilId"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="Hiện chưa có slot review sắp tới được phân công" />
        )}
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="Slot đã đăng ký" style={{ height: '100%' }}>
            {registeredSlots.length > 0 ? (
              <Table
                columns={slotColumns}
                dataSource={registeredSlots}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Chưa đăng ký slot nào" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Toàn bộ phân công hội đồng" style={{ height: '100%' }}>
            {assignedSlots.length > 0 ? (
              <Table
                columns={assignedColumns}
                dataSource={assignedSlots}
                rowKey="councilId"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Chưa được phân vào hội đồng nào" />
            )}
          </Card>
        </Col>
      </Row>
    </PageWrapper>
  )
}
