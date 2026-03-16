import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Tag } from '@/types/entities'

export const TagsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tags'] })

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await tagService.getAll()
      return res.data.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: tagService.create,
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
        message.success('Tạo tag thành công')
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
    mutationFn: ({ id, data }: { id: number; data: { id: number; name: string; description?: string } }) =>
      tagService.update(id, data),
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
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
    mutationFn: tagService.delete,
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
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

  const openEdit = (record: Tag) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        name: values.name,
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
    { title: 'Mô tả', dataIndex: 'description' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? 'Hoạt động' : 'Tạm dừng'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Tag) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa tag "${record.name}"?`,
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
      title="Quản lý tags"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm tag
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? 'Chỉnh sửa tag' : 'Thêm tag'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="VD: Machine Learning" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
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
