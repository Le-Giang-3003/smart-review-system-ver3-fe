import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reviewSlotService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { ReviewSlot } from '@/types/entities'

export const ReviewSlotsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [periodFilter, setPeriodFilter] = useState<number | undefined>()
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

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
      if (res.data.isSuccess) {
        message.success('Tạo slot thành công')
        queryClient.invalidateQueries({ queryKey: ['review-slots'] })
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      reviewSlotService.update(id, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Cập nhật thành công')
        queryClient.invalidateQueries({ queryKey: ['review-slots'] })
        setModalOpen(false)
        setEditingId(null)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: reviewSlotService.delete,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Xóa thành công')
        queryClient.invalidateQueries({ queryKey: ['review-slots'] })
      } else {
        message.error(res.data.message)
      }
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
      slotDate: dayjs(record.slotDate),
      slotNumber: record.slotNumber,
      startTime: dayjs(record.startTime, 'HH:mm'),
      endTime: dayjs(record.endTime, 'HH:mm'),
      location: record.location,
      notes: record.notes,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        reviewPeriodId: values.reviewPeriodId,
        slotDate: values.slotDate.format('YYYY-MM-DD'),
        slotNumber: values.slotNumber,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        location: values.location,
        notes: values.notes,
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
    { title: 'Đợt review', dataIndex: 'reviewPeriodName' },
    {
      title: 'Ngày',
      dataIndex: 'slotDate',
      render: (d: string) => formatDate(d),
    },
    { title: 'Slot #', dataIndex: 'slotNumber', width: 80 },
    {
      title: 'Thời gian',
      render: (_: unknown, r: ReviewSlot) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    { title: 'Địa điểm', dataIndex: 'location' },
    {
      title: 'Trạng thái',
      dataIndex: 'isCancelled',
      render: (c: boolean) => (c ? 'Đã hủy' : 'Hoạt động'),
    },
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
              Modal.confirm({
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
          <Form.Item name="slotDate" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="slotNumber" label="Số slot" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="startTime" label="Bắt đầu" rules={[{ required: true }]}>
              <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item name="endTime" label="Kết thúc" rules={[{ required: true }]}>
              <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Space>
          <Form.Item name="location" label="Địa điểm">
            <Input placeholder="VD: Phòng A101" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
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
