import { useState } from 'react'
import { Table, Button, Space, Select, message } from 'antd'
import { CheckOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewSessionService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { ReviewSession } from '@/types/entities'

export const ReviewSessionsPage = () => {
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const queryClient = useQueryClient()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['review-sessions', periodFilter],
    queryFn: async () => {
      const res = await reviewSessionService.getAll({ reviewPeriodId: periodFilter })
      return res.data.data ?? []
    },
  })

  const approveMutation = useMutation({
    mutationFn: reviewSessionService.approve,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Phê duyệt thành công')
        queryClient.invalidateQueries({ queryKey: ['review-sessions'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      reviewSessionService.reject(id, reason),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Từ chối thành công')
        queryClient.invalidateQueries({ queryKey: ['review-sessions'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const lockMutation = useMutation({
    mutationFn: reviewSessionService.lock,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Khóa phiên thành công')
        queryClient.invalidateQueries({ queryKey: ['review-sessions'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Đợt review', dataIndex: 'reviewPeriodName' },
    {
      title: 'Ngày',
      dataIndex: 'slotDate',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ReviewSession) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Nhóm', dataIndex: 'groupName' },
    { title: 'Đề tài', dataIndex: 'topicTitle' },
    {
      title: 'Hội đồng',
      dataIndex: 'councilMembers',
      render: (members: { lecturerName: string }[] | undefined) =>
        members?.map((m) => m.lecturerName).join(', ') || '-',
    },
    {
      title: 'Trạng thái ĐK',
      dataIndex: 'registrationStatus',
      render: (s: number) => (s === 0 ? 'Chờ duyệt' : s === 1 ? 'Đã duyệt' : 'Từ chối'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: ReviewSession) => (
        <Space>
          {record.registrationStatus === 0 && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => approveMutation.mutate(record.id)}
                size="small"
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  const reason = prompt('Lý do từ chối:')
                  if (reason) rejectMutation.mutate({ id: record.id, reason })
                }}
                size="small"
              >
                Từ chối
              </Button>
            </>
          )}
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => lockMutation.mutate(record.id)}
            size="small"
          >
            Khóa
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Phiên review"
      extra={
        <Select
          placeholder="Lọc theo đợt review"
          allowClear
          style={{ width: 250 }}
          onChange={setPeriodFilter}
          options={periods.map((p) => ({ label: p.name, value: p.id }))}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={sessions}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </PageWrapper>
  )
}
