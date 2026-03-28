import { useState } from 'react'
import { App, Alert, Button, Drawer, Input, Space, Table, Select, Card } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lecturerApiService, reviewAssignmentService } from '@/api/lecturer.service'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { CouncilListItem, ReviewPeriod } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'
import { formatDate, formatTime } from '@/utils/format'

type FlatRow = {
  key: string
  assignmentId: number
  councilId: number
  groupName: string
  topicTitle?: string | null
  date: string
  startTime: string
  endTime: string
  room?: string | null
  comment?: string | null
}

export const LecturerFeedbackPage = () => {
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [periodId, setPeriodId] = useState<number | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<FlatRow | null>(null)
  const [commentText, setCommentText] = useState('')
  const queryClient = useQueryClient()
  const { message } = App.useApp()

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

  const { data: schedule, error: scheduleError } = useQuery({
    queryKey: ['lecturer-my-schedule', periodId],
    queryFn: async () => {
      if (!periodId) return null
      const res = await lecturerApiService.getMySchedule(periodId)
      if (!isApiSuccess(res.data)) throw new Error(res.data.message || 'Không tải được lịch')
      return res.data.data
    },
    enabled: !!periodId,
  })

  const rows: FlatRow[] =
    schedule?.councils?.flatMap((c: CouncilListItem) =>
      (c.groups ?? []).map((g) => ({
        key: `${c.councilId}-${g.assignmentId}`,
        assignmentId: g.assignmentId,
        councilId: c.councilId,
        groupName: g.groupName,
        topicTitle: g.topicTitleEn,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        comment: undefined,
      }))
    ) ?? []

  const openEdit = async (row: FlatRow) => {
    setEditing(row)
    setDrawerOpen(true)
    setCommentText('')
    const res = await reviewAssignmentService.getById(row.assignmentId)
    if (isApiSuccess(res.data) && res.data.data?.reviewComment != null) {
      setCommentText(res.data.data.reviewComment ?? '')
    }
  }

  const saveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      reviewAssignmentService.updateComment(id, comment),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Đã lưu nhận xét')
        setDrawerOpen(false)
        queryClient.invalidateQueries({ queryKey: ['lecturer-my-schedule', periodId] })
      } else {
        message.error(res.data.message || 'Lưu thất bại')
      }
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Lưu thất bại'),
  })

  const columns = [
    {
      title: 'Ngày/giờ',
      render: (_: unknown, r: FlatRow) =>
        `${formatDate(r.date)} ${formatTime(r.startTime)}–${formatTime(r.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (v?: string | null) => v || '—' },
    { title: 'Nhóm', dataIndex: 'groupName' },
    { title: 'Đề tài', dataIndex: 'topicTitle', render: (v?: string | null) => v || '—' },
    {
      title: 'Thao tác',
      render: (_: unknown, r: FlatRow) => (
        <Button type="link" size="small" onClick={() => openEdit(r)}>
          Nhận xét
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper title="Nhận xét nhóm (hội đồng)" subtitle="Ghi nhận xét theo từng phân công.">
      {scheduleError ? (
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message={(scheduleError as Error).message} />
      ) : null}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Học kỳ"
            style={{ width: 200 }}
            value={semesterId}
            onChange={(v) => {
              setSemesterId(v)
              setPeriodId(undefined)
            }}
            options={semesters.map((s: { id: number; code: string; name: string }) => ({
              label: `${s.code} — ${s.name}`,
              value: s.id,
            }))}
          />
          <Select
            placeholder="Đợt review"
            style={{ width: 280 }}
            value={periodId}
            onChange={setPeriodId}
            options={periods.map((p: { id: number; name: string }) => ({ label: p.name, value: p.id }))}
          />
        </Space>
      </Card>

      <Table
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={!schedule && !!periodId}
        pagination={false}
      />

      <Drawer
        title={editing ? `Nhận xét — ${editing.groupName}` : 'Nhận xét'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        extra={
          <Button
            type="primary"
            loading={saveMutation.isPending}
            onClick={() => editing && saveMutation.mutate({ id: editing.assignmentId, comment: commentText })}
          >
            Lưu
          </Button>
        }
      >
        <Input.TextArea rows={10} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
      </Drawer>
    </PageWrapper>
  )
}
