import { useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  App,
  Card,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, lecturerService, studentService } from '@/api/admin.service'
import { authService } from '@/api/auth.service'
import { isApiSuccess } from '@/types/api'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDateTime } from '@/utils/format'
import { ROLE_LABELS, ROLE_COLORS } from '@/constants'
import { extractListFromApiData } from '@/utils/api'

export const UsersPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>()
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const selectedRole = Form.useWatch('role', form)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: async () => {
      const res = await userService.getAll({
        search: search || undefined,
        role: roleFilter,
        page: 1,
        pageSize: 100,
      })
      return extractListFromApiData(res.data.data)
    },
  })

  const { data: lecturersData } = useQuery({
    queryKey: ['lecturers-for-account'],
    queryFn: async () => {
      const res = await lecturerService.getAll('', '', 1, 500)
      return extractListFromApiData(res.data.data)
    },
    enabled: createModalOpen && selectedRole === 'Lecturer',
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students-for-account'],
    queryFn: async () => {
      const res = await studentService.getAll('', 1, 500)
      return extractListFromApiData(res.data.data)
    },
    enabled: createModalOpen && selectedRole === 'Student',
  })

  const createAccountMutation = useMutation({
    mutationFn: authService.createAccount,
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        message.success('Tạo tài khoản thành công')
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setCreateModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.message || 'Tạo tài khoản thất bại')
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Tạo tài khoản thất bại')
    },
  })

  const lockUnlockMutation = useMutation({
    mutationFn: authService.lockUnlockAccount,
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        message.success('Cập nhật trạng thái tài khoản thành công')
        queryClient.invalidateQueries({ queryKey: ['users'] })
      } else {
        message.error(res.message || 'Cập nhật thất bại')
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Cập nhật thất bại')
    },
  })

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] || 'default'}>{ROLE_LABELS[role] || role}</Tag>
      ),
    },
    {
      title: 'Liên kết',
      render: (_: unknown, record: any) =>
        record.lecturerName || record.studentName || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isLocked',
      render: (isLocked: boolean) =>
        isLocked ? (
          <Tag color="error" icon={<LockOutlined />}>
            Đã khóa
          </Tag>
        ) : (
          <Tag color="success" icon={<UnlockOutlined />}>
            Hoạt động
          </Tag>
        ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLoginAt',
      render: (d?: string) => (d ? formatDateTime(d) : 'Chưa đăng nhập'),
    },
    {
      title: 'Thao tác',
      render: (_: unknown, record: any) => (
        <Popconfirm
          title={record.isLocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'}
          onConfirm={() =>
            lockUnlockMutation.mutate({
              userId: record.id,
              isLocked: !record.isLocked,
            })
          }
        >
          <Button
            size="small"
            danger={!record.isLocked}
            icon={record.isLocked ? <UnlockOutlined /> : <LockOutlined />}
          >
            {record.isLocked ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Quản lý tài khoản"
      subtitle="Tạo và quản lý tài khoản người dùng"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields()
            setCreateModalOpen(true)
          }}
        >
          Tạo tài khoản
        </Button>
      }
    >
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#D6D3D1' }} />}
            placeholder="Tìm kiếm theo email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo vai trò"
            style={{ width: 160 }}
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            options={[
              { label: 'Quản trị viên', value: 'Admin' },
              { label: 'Giảng viên', value: 'Lecturer' },
              { label: 'Sinh viên', value: 'Student' },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={usersData || []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Tạo tài khoản mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createAccountMutation.mutate(values)}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email tài khoản" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { label: 'Quản trị viên', value: 'Admin' },
                { label: 'Giảng viên', value: 'Lecturer' },
                { label: 'Sinh viên', value: 'Student' },
              ]}
            />
          </Form.Item>
          {selectedRole === 'Lecturer' && (
            <Form.Item name="lecturerId" label="Liên kết giảng viên">
              <Select
                showSearch
                placeholder="Chọn giảng viên"
                optionFilterProp="label"
                allowClear
                options={(lecturersData || []).map((l: any) => ({
                  label: `${l.fullName} (${l.lecturerCode})`,
                  value: l.id,
                }))}
              />
            </Form.Item>
          )}
          {selectedRole === 'Student' && (
            <Form.Item name="studentId" label="Liên kết sinh viên">
              <Select
                showSearch
                placeholder="Chọn sinh viên"
                optionFilterProp="label"
                allowClear
                options={(studentsData || []).map((s: any) => ({
                  label: `${s.fullName} (${s.studentCode})`,
                  value: s.id,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createAccountMutation.isPending}
              >
                Tạo tài khoản
              </Button>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
