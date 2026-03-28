import { useState } from 'react'
import { Table, Input, Select, Tag, App, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDateTime } from '@/utils/format'
import { ROLE_LABELS, ROLE_COLORS, ROLE_VALUE_LABELS, ROLE_VALUE_COLORS } from '@/constants'
import { extractListFromApiData } from '@/utils/api'
import type { UserListItem } from '@/types/entities'

/** BE chỉ có GET `/users` — không tạo/khóa tài khoản qua API. */
export const UsersPage = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>()
  const { modal } = App.useApp()

  const { data: usersData, isLoading } = useQuery<UserListItem[]>({
    queryKey: ['users', search, roleFilter],
    queryFn: async () => {
      const res = await userService.getAll({
        search: search || undefined,
        role: roleFilter,
        page: 1,
        pageSize: 100,
      })
      return extractListFromApiData<UserListItem>(res.data?.data)
    },
  })

  const roleLabel = (role: string | number) => {
    if (typeof role === 'number') {
      return ROLE_VALUE_LABELS[role] ?? String(role)
    }
    return ROLE_LABELS[role] ?? String(role)
  }

  const roleColor = (role: string | number) => {
    if (typeof role === 'number') {
      return ROLE_VALUE_COLORS[role] ?? 'default'
    }
    return ROLE_COLORS[role] ?? 'default'
  }

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role: string | number) => (
        <Tag color={roleColor(role)}>{roleLabel(role)}</Tag>
      ),
    },
    {
      title: 'Liên kết',
      render: (_: unknown, record: UserListItem) =>
        record.linkedName ?? record.lecturerName ?? record.studentName ?? '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isLocked',
      render: (isLocked: boolean) =>
        isLocked ? <Tag color="error">Đã khóa</Tag> : <Tag color="success">Hoạt động</Tag>,
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLoginAt',
      render: (d?: string) => (d ? formatDateTime(d) : 'Chưa đăng nhập'),
    },
  ]

  return (
    <PageWrapper
      title="Quản lý tài khoản"
      subtitle="Chỉ xem danh sách — tạo/khóa tài khoản không có trên API backend hiện tại"
      extra={
        <a
          onClick={() =>
            modal.info({
              title: 'Thông tin',
              content:
                'UsersController BE chỉ hỗ trợ GET. Thao tác quản lý user thực hiện qua seed/DB hoặc khi backend bổ sung endpoint.',
            })
          }
        >
          Giúp
        </a>
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
    </PageWrapper>
  )
}
