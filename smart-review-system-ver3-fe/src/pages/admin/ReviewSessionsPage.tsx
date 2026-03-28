import { useState } from 'react'
import { Table, Space, Select, Card, Tag, Drawer, Descriptions } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { councilService, reviewPeriodService, semesterService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { CouncilListItem, ReviewPeriod } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const ReviewSessionsPage = () => {
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [periodId, setPeriodId] = useState<number | undefined>()
  const [detail, setDetail] = useState<CouncilListItem | null>(null)

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

  const { data: councils = [], isLoading } = useQuery({
    queryKey: ['councils', periodId],
    queryFn: async () => {
      if (!periodId) return []
      const res = await councilService.getForReviewPeriod(periodId, { pageSize: 200 })
      return extractListFromApiData<CouncilListItem>(res.data?.data)
    },
    enabled: !!periodId,
  })

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Giờ',
      render: (_: unknown, r: CouncilListItem) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (v?: string | null) => v || '—' },
    {
      title: 'Hội đồng',
      render: (_: unknown, r: CouncilListItem) =>
        r.members?.map((m) => `${m.fullName}${m.isChairman ? ' (CT)' : ''}`).join(', ') || '—',
    },
    {
      title: 'Nhóm',
      render: (_: unknown, r: CouncilListItem) => r.groups?.map((g) => g.groupName).join(', ') || '—',
    },
    {
      title: '',
      key: 'x',
      render: (_: unknown, r: CouncilListItem) => (
        <a onClick={() => setDetail(r)}>Chi tiết</a>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Hội đồng & phân công"
      subtitle="Dữ liệu từ GET /review-periods/{id}/councils (admin)"
    >
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
        rowKey="councilId"
        loading={isLoading}
        columns={columns}
        dataSource={councils}
        pagination={false}
      />

      <Drawer
        title="Chi tiết hội đồng"
        open={!!detail}
        onClose={() => setDetail(null)}
        width={480}
      >
        {detail && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Council ID">{detail.councilId}</Descriptions.Item>
            <Descriptions.Item label="Slot ID">{detail.slotId}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {formatDate(detail.date)} {formatTime(detail.startTime)} – {formatTime(detail.endTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Thứ">{detail.dayOfWeek}</Descriptions.Item>
            <Descriptions.Item label="Thành viên">
              {detail.members?.map((m) => (
                <Tag key={m.lecturerId}>
                  {m.fullName} {m.isChairman ? '(Chủ tịch)' : ''}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm / assignment">
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {detail.groups?.map((g) => (
                  <li key={g.assignmentId}>
                    {g.groupName} — {g.topicTitleEn || g.topicCode || '—'}{' '}
                    {g.hasComment ? <Tag color="green">Đã có nhận xét</Tag> : <Tag>Chưa nhận xét</Tag>}
                  </li>
                ))}
              </ul>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageWrapper>
  )
}
