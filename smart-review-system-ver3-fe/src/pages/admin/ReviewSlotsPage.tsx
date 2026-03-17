import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reviewSlotService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { ReviewSlot } from '@/types/entities'

export const ReviewSlotsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['review-slots'] })

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['review-slots', periodFilter],
    queryFn: async () => {
      const res = await reviewSlotService.getAll(periodFilter)
      return res.data.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: reviewSlotService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Tạo slot thành công')
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Tạo thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      reviewSlotService.update(id, data),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật thành công')
        setModalOpen(false)
        setEditingId(null)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Cập nhật thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: reviewSlotService.delete,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Xóa thành công')
      } else {
        message.error(res.data.message || 'Xóa thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const openCreate = () => {
    form.resetFields()
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (record: ReviewSlot) => {
    form.setFieldsValue({
      reviewPeriodId: record.reviewPeriodId,
      date: dayjs(record.date),
      startTime: dayjs(record.startTime, 'HH:mm'),
      endTime: dayjs(record.endTime, 'HH:mm'),
      room: record.room,
      maxGroups: record.maxGroups,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        reviewPeriodId: values.reviewPeriodId,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        room: values.room,
        maxGroups: Number(values.maxGroups) || 5,
      }
      if (editingId) {
        updateMutation.mutate({ id: editingId, data: { ...payload, id: editingId } })
      } else {
        createMutation.mutate(payload)
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ReviewSlot) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (v: string) => v || '-' },
    { title: 'Nhóm tối đa', dataIndex: 'maxGroups', align: 'center' as const },
    { title: 'GV đã ĐK', dataIndex: 'registeredLecturers', align: 'center' as const, render: (v: number) => v ?? 0 },
    { title: 'Nhóm đã ĐK', dataIndex: 'registeredGroups', align: 'center' as const, render: (v: number) => v ?? 0 },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: ReviewSlot) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: 'Xóa slot này?',
                onOk: () => deleteMutation.mutate(record.id),
              })
            }}
            size="small"
          />
        </Space>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Quản lý slot review"
      extra={
        <Space>
          <Select
            placeholder="Lọc theo đợt review"
            allowClear
            style={{ width: 200 }}
            onChange={setPeriodFilter}
            options={periods.map((p) => ({ label: p.name, value: p.id }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm slot
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={slots}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? 'Chỉnh sửa slot' : 'Thêm slot'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="reviewPeriodId" label="Đợt review" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn đợt review"
              options={periods.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="startTime" label="Bắt đầu" rules={[{ required: true }]}>
              <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="endTime" label="Kết thúc" rules={[{ required: true }]}>
              <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Space>
          <Form.Item name="room" label="Phòng">
            <Input placeholder="VD: Phòng A101" />
          </Form.Item>
          <Form.Item name="maxGroups" label="Số nhóm tối đa">
            <Input type="number" min={1} placeholder="5" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
