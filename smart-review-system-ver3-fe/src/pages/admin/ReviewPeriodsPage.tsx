import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import { formatDate } from '@/utils/format'
// Constants handled dynamically
import { PageWrapper } from '@/components/common/PageWrapper'
import type { ReviewPeriod } from '@/types/entities'

export const ReviewPeriodsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: reviewPeriodService.create,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Tạo đợt review thành công')
        queryClient.invalidateQueries({ queryKey: ['review-periods'] })
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      reviewPeriodService.update(id, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Cập nhật thành công')
        queryClient.invalidateQueries({ queryKey: ['review-periods'] })
        setModalOpen(false)
        setEditingId(null)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: reviewPeriodService.delete,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Xóa thành công')
        queryClient.invalidateQueries({ queryKey: ['review-periods'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const openMutation = useMutation({
    mutationFn: reviewPeriodService.open,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Mở đợt review thành công')
        queryClient.invalidateQueries({ queryKey: ['review-periods'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const closeMutation = useMutation({
    mutationFn: reviewPeriodService.close,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Đóng đợt review thành công')
        queryClient.invalidateQueries({ queryKey: ['review-periods'] })
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

  const openEdit = (record: ReviewPeriod) => {
    form.setFieldsValue({
      semesterId: record.semesterId,
      name: record.name,
      round: record.round,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        semesterId: values.semesterId,
        name: values.name,
        round: values.round,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
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
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Học kỳ', dataIndex: 'semesterName' },
    {
      title: 'Vòng',
      dataIndex: 'round',
      render: (r: string) => r,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'startDate',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endDate',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => s,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ReviewPeriod) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          {record.status === 'Draft' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => openMutation.mutate(record.id)}
              size="small"
            >
              Mở
            </Button>
          )}
          {record.status === 'Open' && (
            <Button
              type="link"
              icon={<StopOutlined />}
              onClick={() => closeMutation.mutate(record.id)}
              size="small"
            >
              Đóng
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa đợt review "${record.name}"?`,
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
      title="Quản lý đợt review"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm đợt review
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={periods}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? 'Chỉnh sửa đợt review' : 'Thêm đợt review'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={600}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 8 }}>
          <Form.Item name="semesterId" label="Học kỳ" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn học kỳ"
              options={semesters.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="VD: Đợt review vòng 1" />
          </Form.Item>
          <Form.Item name="round" label="Vòng review" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Vòng 1', value: 1 },
                { label: 'Vòng 2', value: 2 },
                { label: 'Vòng 3', value: 3 },
              ]}
            />
          </Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
          </Space>
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
