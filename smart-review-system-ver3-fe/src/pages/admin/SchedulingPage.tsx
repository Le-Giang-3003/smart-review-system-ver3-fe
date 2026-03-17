import { useState } from 'react'
import { Card, Button, Select, Table, Alert, App, Empty, Tag } from 'antd'
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
        if (res.data.data) {
          queryClient.setQueryData(['scheduling-result', selectedPeriodId], res.data.data)
        }
      } else {
        message.error(res.data.message || 'Chạy thuật toán thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['review-periods'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lên lịch thất bại')
    },
  })

  const handleGenerate = () => {
    if (selectedPeriodId) {
      runMutation.mutate(selectedPeriodId)
    } else {
      message.warning('Chọn đợt review')
    }
  }

  const selectedPeriod = periods.find((p: any) => p.id === selectedPeriodId)

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
      render: (groups: { groupName: string; topicTitle?: string }[]) =>
        groups?.length > 0
          ? groups.map((g) => g.groupName).join(', ')
          : '-',
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
        members?.length > 0
          ? members.map((m) => `${m.fullName}${m.isChairman ? ' (CT)' : ''}`).join(', ')
          : '-',
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      width: 80,
      render: (score: number) => score > 0 ? <Tag color="blue">{score.toFixed(2)}</Tag> : '-',
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
            options={periods.map((p: any) => ({
              label: `${p.name} (${p.status})`,
              value: p.id,
            }))}
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={runMutation.isPending}
            onClick={handleGenerate}
            disabled={!selectedPeriodId}
          >
            Chạy thuật toán
          </Button>
        </div>

        {selectedPeriod && selectedPeriod.status !== 'Open' && selectedPeriod.status !== 'Scheduling' && (
          <Alert
            message={`Đợt review này đang ở trạng thái "${selectedPeriod.status}". Chỉ đợt ở trạng thái "Open" mới có thể chạy thuật toán.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isResultLoading && <p>Đang tải kết quả...</p>}

        {scheduleResult && (
          <>
            <Alert
              message={`Thống kê: Tổng ${scheduleResult.totalSlots} slot | ${scheduleResult.scheduledSlots} đã xếp lịch | ${scheduleResult.unschedulableSlots} chưa xếp được`}
              description={
                scheduleResult.unschedulableReasons?.length > 0
                  ? scheduleResult.unschedulableReasons.map((r, i) => <div key={i}>• {r}</div>)
                  : scheduleResult.scheduledSlots === 0 && scheduleResult.totalSlots > 0
                    ? 'Không có slot nào xếp được. Hãy kiểm tra: (1) Các nhóm đã đăng ký slot chưa? (2) Giảng viên đã đăng ký slot chưa? (3) Mỗi slot cần ít nhất 2 giảng viên đăng ký.'
                    : scheduleResult.totalSlots === 0
                      ? 'Đợt review này chưa có slot nào. Vui lòng tạo slot trước.'
                      : undefined
              }
              type={
                scheduleResult.scheduledSlots > 0 && scheduleResult.unschedulableSlots === 0
                  ? 'success'
                  : scheduleResult.scheduledSlots > 0
                    ? 'warning'
                    : 'error'
              }
              showIcon
              style={{ marginBottom: 16 }}
            />

            {scheduleResult.assignments.length > 0 ? (
              <Table
                columns={sessionColumns}
                dataSource={scheduleResult.assignments}
                rowKey="reviewSlotId"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="Chưa có phiên review nào được xếp lịch" />
            )}
          </>
        )}

        {selectedPeriodId && !isResultLoading && !scheduleResult && (
          <Empty description="Chưa có kết quả. Nhấn 'Chạy thuật toán' để bắt đầu." />
        )}
      </Card>
    </PageWrapper>
  )
}
