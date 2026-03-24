import { useState } from 'react'
import { Table, Button, Space, Select, App, Alert } from 'antd'
import { CheckOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewSessionService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { ReviewSession } from '@/types/entities'

export const ReviewSessionsPage = () => {
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['review-sessions'] })

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
      if (isApiSuccess(res.data)) {
        message.success('Phê duyệt thành công')
      } else {
        message.error(res.data.message || 'Phê duyệt thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      reviewSessionService.reject(id, reason),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Từ chối thành công')
      } else {
        message.error(res.data.message || 'Từ chối thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const lockMutation = useMutation({
    mutationFn: reviewSessionService.lock,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Khóa phiên thành công')
      } else {
        message.error(res.data.message || 'Khóa thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
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
      render: (members: Array<{ fullName?: string; lecturerName?: string }> | undefined) =>
        members?.map((m) => m.fullName ?? m.lecturerName ?? '').filter(Boolean).join(', ') ||
        '-',
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
          value={periodFilter}
          onChange={setPeriodFilter}
          options={periods.map((p) => ({ label: p.name, value: p.id }))}
        />
      }
    >
      {periodFilter && sessions.length === 0 && !isLoading && (
        <Alert
          message="Chưa có phiên review"
          description="Phiên review được tạo khi chạy Lên lịch. Vào trang Lên lịch, chọn đợt review và nhấn 'Chạy lên lịch' để tạo phiên review."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
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
