import { useState } from 'react'
import { Table, Button, Space, Select, App, Alert, Drawer, Collapse, Tag, Empty } from 'antd'
import { CheckOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewSessionService, reviewPeriodService } from '@/api/admin.service'
import { feedbackService } from '@/api/lecturer.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { GroupFeedbackHistory, ReviewSession } from '@/types/entities'
import { FEEDBACK_STATUS_LABELS, SUGGESTION_LABELS } from '@/constants'

export const ReviewSessionsPage = () => {
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [historyGroupId, setHistoryGroupId] = useState<number>()
  const [historyOpen, setHistoryOpen] = useState(false)
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

  const { data: historyData, isFetching: isHistoryLoading } = useQuery({
    queryKey: ['group-feedback-history', historyGroupId],
    queryFn: async () => {
      if (!historyGroupId) return null
      const res = await feedbackService.getGroupHistory(historyGroupId)
      return (res.data?.data ?? null) as GroupFeedbackHistory | null
    },
    enabled: !!historyGroupId,
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
          <Button
            type="link"
            onClick={() => {
              setHistoryGroupId(record.groupId)
              setHistoryOpen(true)
            }}
            size="small"
          >
            Xem lịch sử đánh giá
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
      <Drawer
        title="Lịch sử đánh giá nhóm"
        width={780}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      >
        {!historyData && !isHistoryLoading ? (
          <Empty description="Nhóm này chưa có lịch sử đánh giá" />
        ) : (
          <>
            <p>
              <b>Nhóm:</b> {historyData?.groupName || '-'}
            </p>
            <p>
              <b>Đề tài:</b> {historyData?.topicTitle || '-'}
            </p>
            <Collapse
              items={(historyData?.rounds ?? []).map((round) => ({
                key: String(round.round),
                label: `Round ${round.round} - ${round.reviewPeriodName}`,
                children:
                  round.feedbacks?.length > 0 ? (
                    <Table
                      size="small"
                      pagination={false}
                      rowKey="feedbackId"
                      dataSource={round.feedbacks}
                      columns={[
                        { title: 'Giảng viên', dataIndex: 'reviewerName' },
                        {
                          title: 'Vai trò',
                          dataIndex: 'isChairman',
                          width: 110,
                          render: (value: boolean) =>
                            value ? <Tag color="gold">Chairman</Tag> : <Tag>Member</Tag>,
                        },
                        {
                          title: 'Nhận xét tổng',
                          dataIndex: 'overallComment',
                          render: (value?: string) => value || '-',
                        },
                        {
                          title: 'Đề xuất',
                          dataIndex: 'suggestion',
                          width: 130,
                          render: (value?: number) =>
                            value == null ? '-' : SUGGESTION_LABELS[value] || String(value),
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          width: 110,
                          render: (value: number) => FEEDBACK_STATUS_LABELS[value] || String(value),
                        },
                      ]}
                    />
                  ) : (
                    <Empty description="Round này chưa có feedback" />
                  ),
              }))}
            />
          </>
        )}
      </Drawer>
    </PageWrapper>
  )
}
