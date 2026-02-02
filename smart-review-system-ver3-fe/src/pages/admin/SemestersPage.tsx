import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { semesterService } from '@/api/admin.service'
import { formatDate } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { SEMESTER_STATUS_LABELS } from '@/constants'
import type { Semester } from '@/types/entities'

export const SemestersPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: semesters = [], isLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: semesterService.create,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Tạo học kỳ thành công')
        queryClient.invalidateQueries({ queryKey: ['semesters'] })
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { id: number; name: string; academicYear: string; semesterNumber: number; startDate: string; endDate: string; description?: string } }) =>
      semesterService.update(id, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Cập nhật thành công')
        queryClient.invalidateQueries({ queryKey: ['semesters'] })
        setModalOpen(false)
        setEditingId(null)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: semesterService.delete,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Xóa thành công')
        queryClient.invalidateQueries({ queryKey: ['semesters'] })
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

  const openEdit = (record: Semester) => {
    form.setFieldsValue({
      name: record.name,
      academicYear: record.academicYear,
      semesterNumber: record.semesterNumber,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      description: record.description,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        name: values.name,
        academicYear: values.academicYear,
        semesterNumber: values.semesterNumber,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        description: values.description,
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
    { title: 'Năm học', dataIndex: 'academicYear' },
    { title: 'Học kỳ', dataIndex: 'semesterNumber', width: 80 },
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
      render: (s: number) => SEMESTER_STATUS_LABELS[s] ?? s,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Semester) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa học kỳ "${record.name}"?`,
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
      title="Quản lý học kỳ"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm học kỳ
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={semesters}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 8 }}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="VD: Học kỳ 1" />
          </Form.Item>
          <Form.Item name="academicYear" label="Năm học" rules={[{ required: true }]}>
            <Input placeholder="VD: 2024-2025" />
          </Form.Item>
          <Form.Item name="semesterNumber" label="Số học kỳ" rules={[{ required: true }]}>
            <InputNumber min={1} max={3} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
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
