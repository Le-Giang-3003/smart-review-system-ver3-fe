import { useState } from 'react'
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Tag,
  App,
  Space,
  Empty,
  Alert,
  List,
  Descriptions,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { studentService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import {
  GROUP_STATUS_LABELS,
  GROUP_STATUS_COLORS,
  INVITATION_STATUS_LABELS,
  INVITATION_STATUS_COLORS,
} from '@/constants'

export const StudentGroupPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [inviteForm] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const user = useAuthStore((s) => s.user)

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['student-groups'],
    queryFn: async () => {
      const res = await studentApiService.getMyGroup()
      return res.data.data ?? []
    },
  })

  const { data: studentsData } = useQuery({
    queryKey: ['all-students-for-invite'],
    queryFn: async () => {
      const res = await studentService.getAll('', 1, 500)
      const data = res.data.data
      if (Array.isArray(data)) return data
      return data?.items ?? []
    },
    enabled: inviteModalOpen,
  })

  const myGroup = groups.find(
    (g: any) => g.members?.some((m: any) => m.studentId === user?.studentId)
  )

  const createMutation = useMutation({
    mutationFn: studentApiService.createGroup,
    onSuccess: () => {
      message.success('Tạo nhóm thành công')
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      setCreateModalOpen(false)
      createForm.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tạo nhóm thất bại')
    },
  })

  const inviteMutation = useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: number; studentId: number }) =>
      studentApiService.inviteStudent(groupId, studentId),
    onSuccess: () => {
      message.success('Đã gửi lời mời')
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
      setInviteModalOpen(false)
      inviteForm.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Mời thất bại')
    },
  })

  const readyMutation = useMutation({
    mutationFn: studentApiService.markGroupReady,
    onSuccess: () => {
      message.success('Nhóm đã sẵn sàng')
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Thao tác thất bại')
    },
  })

  const isLeader = myGroup?.leaderId === user?.studentId

  const memberColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
    },
    {
      title: 'MSSV',
      dataIndex: 'studentCode',
    },
    {
      title: 'Vai trò',
      render: (_: unknown, record: any) =>
        record.studentId === myGroup?.leaderId ? (
          <Tag color="orange">Nhóm trưởng</Tag>
        ) : (
          <Tag>Thành viên</Tag>
        ),
    },
  ]

  return (
    <PageWrapper
      title="Nhóm của tôi"
      subtitle="Quản lý nhóm, mời thành viên và sẵn sàng cho đợt review"
      extra={
        !myGroup ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Tạo nhóm mới
          </Button>
        ) : undefined
      }
    >
      {!myGroup && !isLoading ? (
        <Card>
          <Empty description="Bạn chưa tham gia nhóm nào">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Tạo nhóm mới
            </Button>
          </Empty>
        </Card>
      ) : myGroup ? (
        <>
          <Card style={{ marginBottom: 20 }}>
            <Descriptions
              title={
                <Space>
                  <TeamOutlined style={{ color: '#F97316' }} />
                  {myGroup.groupName}
                </Space>
              }
              extra={
                <Space>
                  {isLeader && myGroup.status === 'Forming' && (
                    <>
                      <Button
                        icon={<UserAddOutlined />}
                        onClick={() => setInviteModalOpen(true)}
                      >
                        Mời thành viên
                      </Button>
                      <Popconfirm
                        title="Xác nhận nhóm đã sẵn sàng?"
                        description="Sau khi sẵn sàng, bạn không thể mời thêm thành viên."
                        onConfirm={() => readyMutation.mutate(myGroup.id)}
                      >
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          loading={readyMutation.isPending}
                        >
                          Sẵn sàng
                        </Button>
                      </Popconfirm>
                    </>
                  )}
                </Space>
              }
              column={{ xs: 1, sm: 2 }}
            >
              <Descriptions.Item label="Trạng thái">
                <Tag color={GROUP_STATUS_COLORS[myGroup.status] || 'default'}>
                  {GROUP_STATUS_LABELS[myGroup.status] || myGroup.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đề tài">
                {myGroup.topicTitle || 'Chưa đăng ký'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thành viên nhóm" style={{ marginBottom: 20 }}>
            <Table
              columns={memberColumns}
              dataSource={myGroup.members}
              rowKey="studentId"
              pagination={false}
              size="small"
            />
          </Card>

          {myGroup.invitations && myGroup.invitations.length > 0 && (
            <Card title="Lời mời đã gửi">
              <List
                dataSource={myGroup.invitations}
                renderItem={(inv: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={inv.invitedStudentName || `Student #${inv.invitedStudentId}`}
                      description={`Trạng thái: `}
                    />
                    <Tag
                      color={INVITATION_STATUS_COLORS[inv.status] || 'default'}
                    >
                      {INVITATION_STATUS_LABELS[inv.status] || inv.status}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      ) : null}

      <Modal
        title="Tạo nhóm mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values.groupName)}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="groupName"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input placeholder="VD: Nhóm 1" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
              >
                Tạo nhóm
              </Button>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mời sinh viên vào nhóm"
        open={inviteModalOpen}
        onCancel={() => setInviteModalOpen(false)}
        footer={null}
      >
        <Alert
          message="Chọn sinh viên bạn muốn mời vào nhóm"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={(values) =>
            inviteMutation.mutate({
              groupId: myGroup!.id,
              studentId: values.studentId,
            })
          }
          style={{ marginTop: 8 }}
        >
          <Form.Item
            name="studentId"
            label="Sinh viên"
            rules={[{ required: true, message: 'Vui lòng chọn sinh viên' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm theo tên hoặc MSSV"
              optionFilterProp="label"
              options={(studentsData || [])
                .filter(
                  (s: any) =>
                    !s.groupId &&
                    s.id !== user?.studentId
                )
                .map((s: any) => ({
                  label: `${s.fullName} (${s.studentCode})`,
                  value: s.id,
                }))}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={inviteMutation.isPending}
              >
                Gửi lời mời
              </Button>
              <Button onClick={() => setInviteModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
