import { useMemo, useState } from 'react'
import { Card, Table, Button, Select, App, Space, Alert, Empty, Form } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lecturerApiService } from '@/api/lecturer.service'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import type { ReviewPeriod } from '@/types/entities'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime } from '@/utils/format'
import type { ReviewSlot, SlotPreferenceItem } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'
import { isApiSuccess } from '@/types/api'

export const LecturerSlotsPage = () => {
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const [p1, setP1] = useState<number | undefined>()
  const [p2, setP2] = useState<number | undefined>()
  const [p3, setP3] = useState<number | undefined>()
  const [p4, setP4] = useState<number | undefined>()
  const [p5, setP5] = useState<number | undefined>()
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

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['lecturer-slots', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return []
      const res = await lecturerApiService.getSlotsForPeriod(selectedPeriodId)
      return extractListFromApiData<ReviewSlot>(res.data?.data)
    },
    enabled: !!selectedPeriodId,
  })

  const slotOptions = useMemo(
    () => slots.map((s) => ({ label: `${formatDate(s.date)} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`, value: s.id })),
    [slots]
  )

  const saveMutation = useMutation({
    mutationFn: async (prefs: SlotPreferenceItem[]) => {
      const res = await lecturerApiService.registerLecturerPreferences(selectedPeriodId!, prefs)
      return res.data
    },
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        message.success('Đã lưu 5 lựa chọn ưu tiên slot')
      } else {
        message.error(res.message || 'Lưu thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['lecturer-slots'] })
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Lưu thất bại'),
  })

  const onSavePreferences = () => {
    if (!selectedPeriodId) {
      message.warning('Chọn đợt review')
      return
    }
    const ids = [p1, p2, p3, p4, p5]
    if (ids.some((x) => x == null)) {
      message.warning('Chọn đủ 5 slot khác nhau (mức ưu tiên 1–5)')
      return
    }
    if (new Set(ids).size !== 5) {
      message.warning('Không được trùng slot')
      return
    }
    const prefs: SlotPreferenceItem[] = [
      { reviewSlotId: p1!, priority: 1 },
      { reviewSlotId: p2!, priority: 2 },
      { reviewSlotId: p3!, priority: 3 },
      { reviewSlotId: p4!, priority: 4 },
      { reviewSlotId: p5!, priority: 5 },
    ]
    saveMutation.mutate(prefs)
  }

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#F97316' }} />
          {formatDate(d)}
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ReviewSlot) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room?: string) => room || '—',
    },
    { title: 'Max nhóm', dataIndex: 'maxGroups', align: 'center' as const },
  ]

  return (
    <PageWrapper
      title="Đăng ký ưu tiên slot"
      subtitle="Backend yêu cầu đúng 5 slot xếp theo mức ưu tiên 1 (cao nhất) đến 5"
    >
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
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
        </Space>
      </Card>

      {!selectedPeriodId && (
        <Alert type="info" showIcon message="Chọn học kỳ và đợt review để xem slot và đăng ký ưu tiên." />
      )}

      {selectedPeriodId && (
        <>
          <Card title="Danh sách slot" style={{ marginBottom: 16 }}>
            {slots.length === 0 && !slotsLoading ? (
              <Empty />
            ) : (
              <Table columns={columns} dataSource={slots} rowKey="id" loading={slotsLoading} pagination={false} />
            )}
          </Card>
          <Card title="Chọn 5 ưu tiên">
            <Form layout="vertical">
              {[1, 2, 3, 4, 5].map((n) => (
                <Form.Item key={n} label={`Ưu tiên ${n}`}>
                  <Select
                    allowClear
                    placeholder={`Slot cho mức ${n}`}
                    options={slotOptions}
                    style={{ width: '100%', maxWidth: 480 }}
                    value={[p1, p2, p3, p4, p5][n - 1]}
                    onChange={(v) => {
                      const setters = [setP1, setP2, setP3, setP4, setP5]
                      setters[n - 1](v ?? undefined)
                    }}
                  />
                </Form.Item>
              ))}
              <Button type="primary" onClick={onSavePreferences} loading={saveMutation.isPending}>
                Gửi đăng ký ưu tiên
              </Button>
            </Form>
          </Card>
        </>
      )}
    </PageWrapper>
  )
}
