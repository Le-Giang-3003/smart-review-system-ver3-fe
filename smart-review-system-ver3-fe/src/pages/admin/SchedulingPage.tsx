import { useState } from 'react'
import { Card, Button, Select, Table, Alert, App, Empty, Tag, Space } from 'antd'
import { ThunderboltOutlined, UndoOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { schedulingService, reviewPeriodService, semesterService } from '@/api/admin.service'
import { formatDate, formatTime, normalizeReviewPeriodStatusKey } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { type ApiResponse, getApiEnvelopeFromMutationResult, isApiSuccess } from '@/types/api'
import { getApiErrorMessage } from '@/utils/api'
import type { ReviewPeriod, SchedulingResultDto } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const SchedulingPage = () => {
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const queryClient = useQueryClient()
  const { message, modal } = App.useApp()

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: periods = [] } = useQuery<ReviewPeriod[]>({
    queryKey: ['review-periods', semesterId],
    queryFn: async () => {
      if (!semesterId) return []
      const res = await reviewPeriodService.getBySemester(semesterId)
      return extractListFromApiData<ReviewPeriod>(res.data?.data)
    },
    enabled: !!semesterId,
  })

  const { data: scheduleResult, isLoading: isResultLoading } = useQuery<SchedulingResultDto | null>({
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
      const env = getApiEnvelopeFromMutationResult<unknown>(res) as ApiResponse<unknown> | null
      if (env && isApiSuccess(env)) {
        message.success('Chạy thuật toán thành công')
      } else if (env) {
        message.error(env.message || 'Chạy thuật toán thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['review-periods', semesterId] })
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Lên lịch thất bại'))
    },
  })

  const resetMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.reset(periodId),
    onSuccess: (res) => {
      const env = getApiEnvelopeFromMutationResult<unknown>(res) as ApiResponse<unknown> | null
      if (env && isApiSuccess(env)) {
        message.success(env.message || 'Đã reset lịch')
      } else if (env) {
        message.error(env.message || 'Reset lịch thất bại')
      } else {
        message.error('Không xử lý được phản hồi sau khi reset. Vui lòng thử lại.')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['review-periods', semesterId] })
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error, 'Reset lịch thất bại'))
    },
  })

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)
  const periodStatusKey = normalizeReviewPeriodStatusKey(selectedPeriod?.status)

  const handleGenerate = () => {
    if (!selectedPeriodId) {
      message.warning('Chọn đợt review')
      return
    }
    if (periodStatusKey !== 'Scheduling') {
      message.warning('Chỉ chạy khi đợt review ở trạng thái Đang lên lịch (Scheduling).')
      return
    }
    runMutation.mutate(selectedPeriodId)
  }

  const handleResetSchedule = () => {
    if (!selectedPeriodId) {
      message.warning('Chọn đợt review')
      return
    }
    modal.confirm({
      title: 'Reset lịch đợt review?',
      content:
        'Xóa toàn bộ hội đồng đã xếp cho đợt này và đưa trạng thái về «Đang lên lịch» để chạy thuật toán lại. Phù hợp demo — không cần seed lại DB.',
      okText: 'Reset',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: () => resetMutation.mutateAsync(selectedPeriodId),
    })
  }

  const councilColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Giờ',
      render: (_: unknown, r: SchedulingResultDto['councils'][0]) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (r?: string | null) => r || '—' },
    {
      title: 'GV',
      render: (_: unknown, r: SchedulingResultDto['councils'][0]) => (
        <span>
          {r.reviewer1}, {r.reviewer2}
        </span>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'assignedGroups',
      render: (g: string[]) => (g?.length ? g.join(', ') : '—'),
    },
  ]

  return (
    <PageWrapper title="Thuật toán lên lịch">
      <Card style={{ marginBottom: 16 }}>
        <Space wrap align="center">
          <Select
            placeholder="Học kỳ"
            style={{ width: 200 }}
            value={semesterId}
            onChange={(v) => {
              setSemesterId(v)
              setSelectedPeriodId(undefined)
            }}
            options={semesters.map((s: { id: number; code: string; name: string }) => ({
              label: `${s.code} — ${s.name}`,
              value: s.id,
            }))}
          />
          <Select
            placeholder="Đợt review"
            style={{ width: 280 }}
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            options={periods.map((p: { id: number; name: string }) => ({ label: p.name, value: p.id }))}
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={runMutation.isPending}
            onClick={handleGenerate}
            disabled={!selectedPeriodId}
          >
            Chạy xếp lịch
          </Button>
          <Button
            danger
            icon={<UndoOutlined />}
            loading={resetMutation.isPending}
            onClick={handleResetSchedule}
            disabled={!selectedPeriodId}
          >
            Reset lịch
          </Button>
        </Space>
      </Card>

      {selectedPeriodId && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Kết quả hiển thị theo hội đồng đã gán cho từng slot. Slot chưa có hội đồng nằm ở bảng cuối."
        />
      )}

      {!selectedPeriodId && <Empty description="Chọn học kỳ và đợt review để xem kết quả" />}

      {selectedPeriodId && isResultLoading && (
        <Card loading title="Đang tải kết quả..." />
      )}

      {selectedPeriodId && !isResultLoading && scheduleResult && (
        <>
          <Card
            title="Tóm tắt"
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Tag>Tổng slot: {scheduleResult.totalSlots}</Tag>
                <Tag color="success">Đã xếp HĐ: {scheduleResult.scheduledSlots}</Tag>
                <Tag color="warning">Chưa xếp: {scheduleResult.unscheduledSlots}</Tag>
              </Space>
            }
          />
          <Card title="Hội đồng đã xếp" style={{ marginBottom: 16 }}>
            <Table
              rowKey="councilId"
              columns={councilColumns}
              dataSource={scheduleResult.councils}
              pagination={false}
            />
          </Card>
          <Card title="Slot chưa gán hội đồng">
            <Table
              rowKey="slotId"
              columns={[
                { title: 'Slot', dataIndex: 'slotId', width: 80 },
                { title: 'Ngày', dataIndex: 'date', render: (d: string) => formatDate(d) },
                { title: 'Phòng', dataIndex: 'room', render: (r?: string | null) => r || '—' },
                { title: 'Lý do', dataIndex: 'reason' },
              ]}
              dataSource={scheduleResult.unscheduledReasons}
              pagination={false}
            />
          </Card>
        </>
      )}

      {selectedPeriodId && !isResultLoading && !scheduleResult && (
        <Empty description="Chưa có dữ liệu kết quả — có thể chưa chạy thuật toán hoặc đợt không tồn tại" />
      )}
    </PageWrapper>
  )
}
