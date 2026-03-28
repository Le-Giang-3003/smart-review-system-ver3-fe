import { useEffect, useMemo, useState } from 'react'
import { Card, Table, Button, Select, App, Space, Empty, Form, Alert, Tag, Spin } from 'antd'
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import type {
  MyPreferencesDto,
  ReviewPeriod,
  SlotPreferenceDto,
  ReviewSlot,
  SlotPreferenceItem,
} from '@/types/entities'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime } from '@/utils/format'
import { extractListFromApiData } from '@/utils/api'
import { isApiSuccess } from '@/types/api'
import type { ApiResponse } from '@/types/api'

export const StudentSlotsPage = () => {
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
    queryKey: ['student-slots', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return []
      const res = await studentApiService.getSlotsForPeriod(selectedPeriodId)
      return extractListFromApiData<ReviewSlot>(res.data?.data)
    },
    enabled: !!selectedPeriodId,
  })

  const {
    data: myPrefs,
    isLoading: prefsLoading,
    isFetching: prefsFetching,
  } = useQuery({
    queryKey: ['my-group-preferences', selectedPeriodId],
    queryFn: async (): Promise<MyPreferencesDto | null> => {
      if (!selectedPeriodId) return null
      try {
        const res = await studentApiService.getMyGroupPreferences(selectedPeriodId)
        const env = res.data as ApiResponse<MyPreferencesDto>
        if (!isApiSuccess(env) || !env.data) return null
        return env.data
      } catch {
        return null
      }
    },
    enabled: !!selectedPeriodId,
  })

  const isRegistered = (myPrefs?.preferences?.length ?? 0) === 5
  const prefsBusy = prefsLoading || prefsFetching

  useEffect(() => {
    setP1(undefined)
    setP2(undefined)
    setP3(undefined)
    setP4(undefined)
    setP5(undefined)
  }, [selectedPeriodId])

  useEffect(() => {
    if (!myPrefs?.preferences?.length) return
    const ordered = [...myPrefs.preferences].sort((a, b) => a.priority - b.priority)
    if (ordered.length !== 5) return
    setP1(ordered[0].reviewSlotId)
    setP2(ordered[1].reviewSlotId)
    setP3(ordered[2].reviewSlotId)
    setP4(ordered[3].reviewSlotId)
    setP5(ordered[4].reviewSlotId)
  }, [myPrefs])

  const slotOptions = useMemo(
    () =>
      slots.map((s) => ({
        label: `${formatDate(s.date)} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`,
        value: s.id,
      })),
    [slots]
  )

  const saveMutation = useMutation({
    mutationFn: async (payload: { prefs: SlotPreferenceItem[]; isUpdate: boolean }) => {
      const { prefs, isUpdate } = payload
      if (isUpdate) {
        const res = await studentApiService.updateGroupPreferences(selectedPeriodId!, prefs)
        return res.data
      }
      const res = await studentApiService.registerGroupPreferences(selectedPeriodId!, prefs)
      return res.data
    },
    onSuccess: (res, variables) => {
      if (isApiSuccess(res)) {
        message.success(
          variables.isUpdate
            ? 'Đã cập nhật ưu tiên slot cho nhóm'
            : 'Đã lưu 5 lựa chọn ưu tiên slot cho nhóm'
        )
      } else {
        message.error(res?.message || 'Lưu thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['student-slots'] })
      queryClient.invalidateQueries({ queryKey: ['my-group-preferences', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['student-slot-pref-status'] })
    },
    onError: (e: any) => message.error(e.response?.data?.message || 'Lưu thất bại'),
  })

  const onSave = () => {
    if (!selectedPeriodId) {
      message.warning('Chọn đợt review')
      return
    }
    const ids = [p1, p2, p3, p4, p5]
    if (ids.some((x) => x == null)) {
      message.warning('Chọn đủ 5 slot khác nhau')
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
    saveMutation.mutate({ prefs, isUpdate: isRegistered })
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
    { title: 'Phòng', dataIndex: 'room', render: (room?: string) => room || '—' },
    { title: 'Max nhóm', dataIndex: 'maxGroups', align: 'center' as const },
  ]

  const prefColumns = [
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      width: 90,
      align: 'center' as const,
      render: (n: number) => <Tag color="blue">{n}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'slotDate',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Giờ',
      render: (_: unknown, r: SlotPreferenceDto) =>
        `${formatTime(r.slotStartTime)} – ${formatTime(r.slotEndTime)}`,
    },
    { title: 'Phòng', dataIndex: 'slotRoom', render: (v?: string | null) => v || '—' },
  ]

  return (
    <PageWrapper
      title="Đăng ký ưu tiên slot (nhóm)"
      subtitle="Nhóm trưởng chọn đủ 5 slot theo thứ tự ưu tiên — cả nhóm xem trạng thái đăng ký bên dưới."
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

      {selectedPeriodId && (
        <>
          {prefsBusy ? (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Spin tip="Đang kiểm tra trạng thái đăng ký nhóm..." />
            </div>
          ) : isRegistered ? (
            <Alert
              style={{ marginBottom: 16 }}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              message={
                <Space>
                  <span>Đã đăng ký đủ 5 slot ưu tiên</span>
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Hoàn tất
                  </Tag>
                </Space>
              }
              description={
                <Table<SlotPreferenceDto>
                  style={{ marginTop: 12 }}
                  size="small"
                  pagination={false}
                  rowKey="id"
                  columns={prefColumns}
                  dataSource={[...myPrefs!.preferences].sort((a, b) => a.priority - b.priority)}
                />
              }
            />
          ) : (
            <Alert
              style={{ marginBottom: 16 }}
              type="warning"
              showIcon
              icon={<ClockCircleOutlined />}
              message="Chưa đăng ký đủ 5 slot ưu tiên"
              description="Nhóm trưởng cần gửi đủ 5 lựa chọn bên dưới. Sau khi gửi, trạng thái sẽ chuyển sang “Đã đăng ký” để cả nhóm theo dõi."
            />
          )}

          <Card title="Slot trong đợt" style={{ marginBottom: 16 }}>
            {slots.length === 0 && !slotsLoading ? (
              <Empty />
            ) : (
              <Table columns={columns} dataSource={slots} rowKey="id" loading={slotsLoading} pagination={false} />
            )}
          </Card>
          <Card title="5 ưu tiên của nhóm">
            <Form layout="vertical">
              {[1, 2, 3, 4, 5].map((n) => (
                <Form.Item key={n} label={`Ưu tiên ${n}`}>
                  <Select
                    allowClear
                    placeholder={`Slot mức ${n}`}
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
              <Button type="primary" onClick={onSave} loading={saveMutation.isPending}>
                {isRegistered ? 'Cập nhật đăng ký' : 'Gửi đăng ký'}
              </Button>
            </Form>
          </Card>
        </>
      )}
    </PageWrapper>
  )
}
