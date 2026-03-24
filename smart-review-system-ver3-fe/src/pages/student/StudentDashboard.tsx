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
  Button,
  App,
} from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { isApiSuccess } from '@/types/api'
import { PageWrapper } from '@/components/common/PageWrapper'
import { GROUP_STATUS_LABELS, GROUP_STATUS_COLORS } from '@/constants'
import { formatDate, formatTime } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import type { Group, Topic } from '@/types/entities'

function isFullGroupShape(g: unknown): g is Group {
  return (
    !!g &&
    typeof g === 'object' &&
    'members' in (g as Group) &&
    Array.isArray((g as Group).members)
  )
}

function isFullTopicShape(t: unknown): t is Topic {
  return !!t && typeof t === 'object' && 'keywords' in (t as Topic)
}

export const StudentDashboard = () => {
  const queryClient = useQueryClient()
  const { message } = App.useApp()
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

  const respondMutation = useMutation({
    mutationFn: ({ invitationId, accept }: { invitationId: number; accept: boolean }) =>
      studentApiService.respondToInvitation(invitationId, accept),
    onSuccess: (res, { accept }) => {
      if (isApiSuccess(res.data)) {
        message.success(accept ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời')
      } else {
        message.error(res.data.message || 'Thao tác thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Thao tác thất bại')
    },
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

  const {
    studentInfo,
    group,
    topic,
    reviewSchedule,
    upcomingReviews = [],
    pendingInvitations = [],
  } = dashboard

  const displayName =
    studentInfo?.fullName ?? user?.fullName ?? user?.email ?? undefined
  const upcomingSlotCount =
    reviewSchedule?.date != null && reviewSchedule.date !== ''
      ? 1
      : upcomingReviews.length

  return (
    <PageWrapper
      title="Trang sinh viên"
      subtitle={displayName ? `Xin chào, ${displayName}` : undefined}
    >
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #F97316' }}>
            <Statistic
              title="Nhóm"
              value={group ? group.groupName : 'Chưa có'}
              prefix={<TeamOutlined style={{ color: '#F97316' }} />}
              valueStyle={{ fontSize: group ? 28 : 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #3B82F6' }}>
            <Statistic
              title="Đề tài"
              value={topic ? 1 : 0}
              prefix={<FileTextOutlined style={{ color: '#3B82F6' }} />}
              suffix={topic ? '' : 'đề tài'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <Statistic
              title="Phiên review sắp tới"
              value={upcomingSlotCount}
              prefix={<CalendarOutlined style={{ color: '#22C55E' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderTop: '3px solid #EAB308' }}>
            <Statistic
              title="Lời mời chờ phản hồi"
              value={pendingInvitations.length}
              prefix={<BellOutlined style={{ color: '#EAB308' }} />}
            />
          </Card>
        </Col>
      </Row>

      {pendingInvitations.length > 0 && (
        <Card
          title={
            <Space>
              <BellOutlined style={{ color: '#EAB308' }} />
              Lời mời vào nhóm
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <List
            dataSource={pendingInvitations}
            renderItem={(invitation: any) => (
              <List.Item
                actions={[
                  <Button
                    key="accept"
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    loading={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        invitationId: invitation.invitationId,
                        accept: true,
                      })
                    }
                  >
                    Chấp nhận
                  </Button>,
                  <Button
                    key="reject"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    loading={respondMutation.isPending}
                    onClick={() =>
                      respondMutation.mutate({
                        invitationId: invitation.invitationId,
                        accept: false,
                      })
                    }
                  >
                    Từ chối
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={`Nhóm: ${invitation.groupName || 'N/A'}`}
                  description={`Ngày mời: ${formatDate(invitation.createdAt)}`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin nhóm" style={{ height: '100%' }}>
            {group ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Tên nhóm:</strong> {group.groupName}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Trạng thái:</strong>{' '}
                  <Tag color={GROUP_STATUS_COLORS[group.status] || 'default'}>
                    {GROUP_STATUS_LABELS[group.status] || group.status}
                  </Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Thành viên:</strong>
                </div>
                {isFullGroupShape(group) ? (
                  <List
                    size="small"
                    dataSource={group.members || []}
                    renderItem={(member: any) => (
                      <List.Item>
                        <Space>
                          {member.fullName}
                          <Tag>{member.studentCode}</Tag>
                          {member.studentId === group.leaderId && (
                            <Tag color="orange">Nhóm trưởng</Tag>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                ) : (
                  <List
                    size="small"
                    dataSource={
                      'memberNames' in group && Array.isArray((group as { memberNames: string[] }).memberNames)
                        ? (group as { memberNames: string[] }).memberNames
                        : []
                    }
                    renderItem={(name: string) => (
                      <List.Item>{name}</List.Item>
                    )}
                  />
                )}
              </div>
            ) : (
              <Empty description="Bạn chưa tham gia nhóm nào" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thông tin đề tài" style={{ height: '100%' }}>
            {topic ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Tên đề tài:</strong> {topic.title}
                </div>
                {isFullTopicShape(topic) && topic.description && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>Mô tả:</strong> {topic.description}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <strong>GVHD:</strong> {topic.supervisorName || 'N/A'}
                </div>
                {isFullTopicShape(topic) && topic.keywords && topic.keywords.length > 0 && (
                  <div>
                    <strong>Từ khóa:</strong>{' '}
                    <Space wrap style={{ marginTop: 4 }}>
                      {topic.keywords.map((kw: string, idx: number) => (
                        <Tag key={idx} color="orange">
                          {kw}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="Chưa đăng ký đề tài" />
            )}
          </Card>
        </Col>
      </Row>

      {reviewSchedule &&
        reviewSchedule.date != null &&
        reviewSchedule.date !== '' && (
          <Card title="Lịch review đã xếp" style={{ marginTop: 20 }}>
            <List.Item>
              <List.Item.Meta
                avatar={<CalendarOutlined style={{ fontSize: 20, color: '#F97316' }} />}
                title={`${formatDate(reviewSchedule.date)} | ${formatTime(reviewSchedule.startTime)} - ${formatTime(reviewSchedule.endTime)}`}
                description={
                  <div>
                    <div>{reviewSchedule.room ? `Phòng: ${reviewSchedule.room}` : 'Phòng: Chưa xếp'}</div>
                    {reviewSchedule.councilMembers?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Hội đồng:</strong> {reviewSchedule.councilMembers.join(', ')}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          </Card>
        )}

      {(!reviewSchedule || !reviewSchedule.date) && upcomingReviews.length > 0 && (
        <Card title="Lịch review sắp tới" style={{ marginTop: 20 }}>
          <List
            dataSource={upcomingReviews}
            renderItem={(slot: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CalendarOutlined style={{ fontSize: 20, color: '#F97316' }} />}
                  title={`${formatDate(slot.date)} | ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                  description={slot.room ? `Phòng: ${slot.room}` : 'Phòng: Chưa xếp'}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </PageWrapper>
  )
}
