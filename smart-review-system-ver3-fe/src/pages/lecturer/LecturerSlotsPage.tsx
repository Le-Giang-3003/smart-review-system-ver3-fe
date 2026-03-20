import { useState } from 'react'
import { Card, Table, Button, Select, Tag, App, Space, Alert, Empty } from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lecturerApiService } from '@/api/lecturer.service'
import { reviewPeriodService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { formatDate, formatTime } from '@/utils/format'
import type { ReviewSlot } from '@/types/entities'

export const LecturerSlotsPage = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods-lecturer'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['lecturer-available-slots', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return []
      const res = await lecturerApiService.getAvailableSlots(selectedPeriodId)
      return res.data.data ?? []
    },
    enabled: !!selectedPeriodId,
  })

  const registerMutation = useMutation({
    mutationFn: lecturerApiService.registerForSlot,
    onSuccess: () => {
      message.success('Đăng ký slot thành công')
      queryClient.invalidateQueries({ queryKey: ['lecturer-available-slots'] })
      queryClient.invalidateQueries({ queryKey: ['lecturer-dashboard'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    },
  })

  const unregisterMutation = useMutation({
    mutationFn: lecturerApiService.unregisterFromSlot,
    onSuccess: () => {
      message.success('Hủy đăng ký thành công')
      queryClient.invalidateQueries({ queryKey: ['lecturer-available-slots'] })
      queryClient.invalidateQueries({ queryKey: ['lecturer-dashboard'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Hủy đăng ký thất bại')
    },
  })

  const isRegistered = (slot: ReviewSlot) => {
    return slot.isCurrentUserRegistered === true
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
      sorter: (a: ReviewSlot, b: ReviewSlot) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ReviewSlot) =>
        `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room?: string) => room || <Tag color="default">Chưa xếp</Tag>,
    },
    {
      title: 'Nhóm tối đa',
      dataIndex: 'maxGroups',
      align: 'center' as const,
    },
    {
      title: 'GV đã đăng ký',
      dataIndex: 'registeredLecturers',
      align: 'center' as const,
      render: (count?: number) => count ?? 0,
    },
    {
      title: 'Trạng thái',
      render: (_: unknown, slot: ReviewSlot) =>
        isRegistered(slot) ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã đăng ký
          </Tag>
        ) : (
          <Tag color="default">Chưa đăng ký</Tag>
        ),
    },
    {
      title: 'Thao tác',
      render: (_: unknown, slot: ReviewSlot) =>
        isRegistered(slot) ? (
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            loading={unregisterMutation.isPending}
            onClick={() => unregisterMutation.mutate(slot.id)}
          >
            Hủy đăng ký
          </Button>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            loading={registerMutation.isPending}
            onClick={() => registerMutation.mutate(slot.id)}
          >
            Đăng ký
          </Button>
        ),
    },
  ]

  return (
    <PageWrapper
      title="Đăng ký slot review"
      subtitle="Chọn đợt review và đăng ký các slot bạn có thể tham gia"
    >
      <Card>
        <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select
            placeholder="Chọn đợt review"
            style={{ width: 320 }}
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            options={periods.map((p) => ({
              label: `${p.name} (${p.semesterCode || ''})`,
              value: p.id,
            }))}
            allowClear
          />
        </div>

        {!selectedPeriodId && (
          <Alert
            message="Vui lòng chọn đợt review để xem các slot khả dụng"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {selectedPeriodId && slots.length === 0 && !slotsLoading && (
          <Empty description="Chưa có slot nào trong đợt review này" />
        )}

        {selectedPeriodId && (
          <Table
            columns={columns}
            dataSource={slots}
            rowKey="id"
            loading={slotsLoading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </PageWrapper>
  )
}
