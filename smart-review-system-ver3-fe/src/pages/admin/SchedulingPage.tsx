import { useState } from 'react'
import { Card, Button, Select, Table, Alert, App } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { SchedulingResult } from '@/types/entities'

export const SchedulingPage = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: scheduleResult, isLoading: isResultLoading } = useQuery<SchedulingResult | null>({
    queryKey: ['scheduling-result', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null
      const res = await schedulingService.getResult(selectedPeriodId)
      return res.data.data ?? null
    },
    enabled: !!selectedPeriodId,
  })

  const runMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.run(periodId),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Chạy thuật toán thành công')
      } else {
        message.error(res.data.message || 'Chạy thuật toán thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lên lịch thất bại')
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
    },
  })

  const handleGenerate = () => {
    if (selectedPeriodId) {
      runMutation.mutate(selectedPeriodId)
    } else {
      message.warning('Chọn đợt review')
    }
  }

  const sessionColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: any) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Nhóm',
      dataIndex: 'groups',
      render: (groups: { groupName: string }[]) => groups?.map((g) => g.groupName).join(', ') || '-',
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room: string) => room || 'Chưa xếp',
    },
    {
      title: 'Hội đồng',
      dataIndex: 'members',
      render: (members: { fullName: string; isChairman: boolean }[]) =>
        members?.map((m) => `${m.fullName}${m.isChairman ? ' (CT)' : ''}`).join(', ') || '-',
    },
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
            loading={runMutation.isPending}
            onClick={handleGenerate}
          >
            Chạy thuật toán
          </Button>
        </div>

        {isResultLoading && <p>Đang tải kết quả...</p>}

        {scheduleResult && (
          <>
            <Alert
              message={
                 `Thống kê: ${scheduleResult.scheduledSlots} nhóm đã lên lịch, ${scheduleResult.unschedulableSlots} chưa xếp được.`
              }
              description={
                scheduleResult.unschedulableSlots > 0 && scheduleResult.unschedulableReasons?.length > 0
                  ? `Lý do: ${scheduleResult.unschedulableReasons.join('; ')}`
                  : undefined
              }
              type={scheduleResult.unschedulableSlots === 0 ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={sessionColumns}
              dataSource={scheduleResult.assignments}
              rowKey="reviewSlotId"
              pagination={{ pageSize: 10 }}
              style={{ marginBottom: 16 }}
            />
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
