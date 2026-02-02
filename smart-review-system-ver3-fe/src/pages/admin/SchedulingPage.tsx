import { useState } from 'react'
import { Card, Button, Select, Space, message, Table, Alert } from 'antd'
import { ThunderboltOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { ScheduleResult, ScheduledSession } from '@/types/entities'

export const SchedulingPage = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null)
  const queryClient = useQueryClient()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const generateMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.generate(periodId, false),
    onSuccess: (res) => {
      if (res.data.isSuccess && res.data.data) {
        setScheduleResult(res.data.data)
        message.success('Tạo lịch thành công')
        queryClient.invalidateQueries({ queryKey: ['review-sessions'] })
      } else {
        message.error(res.data.message || 'Tạo lịch thất bại')
      }
    },
    onError: (error: { response?: { data?: { data?: ScheduleResult } } }) => {
      if (error.response?.data?.data) {
        setScheduleResult(error.response.data.data)
      }
      message.error('Tạo lịch thất bại')
    },
  })

  const approveMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.approve(periodId),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Phê duyệt lịch thành công')
        setScheduleResult(null)
        queryClient.invalidateQueries({ queryKey: ['review-sessions'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ periodId, reason }: { periodId: number; reason: string }) =>
      schedulingService.reject(periodId, reason),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Từ chối lịch thành công')
        setScheduleResult(null)
      } else {
        message.error(res.data.message)
      }
    },
  })

  const handleGenerate = () => {
    if (selectedPeriodId) {
      generateMutation.mutate(selectedPeriodId)
    } else {
      message.warning('Chọn đợt review')
    }
  }

  const sessionColumns = [
    {
      title: 'Ngày',
      dataIndex: 'slotDate',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ScheduledSession) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Nhóm', dataIndex: 'groupName' },
    {
      title: 'Hội đồng',
      dataIndex: 'councilMembers',
      render: (members: { lecturerName: string }[]) =>
        members?.map((m) => m.lecturerName).join(', ') || '-',
    },
    { title: 'Điểm thuật toán', dataIndex: 'algorithmScore', width: 120 },
  ]

  return (
    <PageWrapper title="Thuật toán lên lịch">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select
            placeholder="Chọn đợt review"
            style={{ width: 300 }}
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            options={periods.map((p) => ({ label: p.name, value: p.id }))}
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={generateMutation.isPending}
            onClick={handleGenerate}
          >
            Chạy thuật toán
          </Button>
        </div>

        {scheduleResult && (
          <>
            <Alert
              message={
                scheduleResult.isSuccess
                  ? `Thành công: ${scheduleResult.scheduledGroups} nhóm đã lên lịch, ${scheduleResult.unscheduledGroups} nhóm chưa lên lịch`
                  : `Có lỗi: ${scheduleResult.errors?.join(', ')}`
              }
              type={scheduleResult.isSuccess ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            {scheduleResult.warnings && scheduleResult.warnings.length > 0 && (
              <Alert
                message="Cảnh báo"
                description={scheduleResult.warnings.map((w) => w.message).join('; ')}
                type="warning"
                style={{ marginBottom: 16 }}
              />
            )}
            <Table
              columns={sessionColumns}
              dataSource={scheduleResult.scheduledSessions}
              rowKey="sessionId"
              pagination={{ pageSize: 10 }}
              style={{ marginBottom: 16 }}
            />
            {scheduleResult.isSuccess && selectedPeriodId && (
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => approveMutation.mutate(selectedPeriodId)}
                  loading={approveMutation.isPending}
                >
                  Phê duyệt lịch
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    const reason = prompt('Lý do từ chối:')
                    if (reason) rejectMutation.mutate({ periodId: selectedPeriodId, reason })
                  }}
                  loading={rejectMutation.isPending}
                >
                  Từ chối lịch
                </Button>
              </Space>
            )}
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
