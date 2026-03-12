import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { topicService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Topic } from '@/types/entities'

export const TopicsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [tagForm] = Form.useForm()
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const res = await topicService.getAll()
      return res.data.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: topicService.create,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Tạo đề tài thành công')
        queryClient.invalidateQueries({ queryKey: ['topics'] })
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      topicService.update(id, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Cập nhật thành công')
        queryClient.invalidateQueries({ queryKey: ['topics'] })
        setModalOpen(false)
        setEditingId(null)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: topicService.delete,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Xóa thành công')
        queryClient.invalidateQueries({ queryKey: ['topics'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const assignTagsMutation = useMutation({
    mutationFn: ({ id, keywords }: { id: number; keywords: string[] }) =>
      topicService.assignTags(id, keywords),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Gán tags thành công')
        queryClient.invalidateQueries({ queryKey: ['topics'] })
        setTagModalOpen(false)
        setSelectedTopicId(null)
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

  const openEdit = (record: Topic) => {
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      keywords: record.keywords,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const openTagModal = (record: Topic) => {
    setSelectedTopicId(record.id)
    tagForm.setFieldsValue({ keywords: record.keywords || [] })
    setTagModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        const payload = {
          id: editingId,
          title: values.title,
          description: values.description,
        }
        updateMutation.mutate({ id: editingId, data: payload })
      } else {
        const payload = {
          title: values.title,
          description: values.description,
          keywords: values.keywords ?? [],
        }
        createMutation.mutate(payload)
      }
    })
  }

  const onAssignTags = () => {
    tagForm.validateFields().then((values) => {
      if (selectedTopicId) {
        assignTagsMutation.mutate({ id: selectedTopicId, keywords: values.keywords ?? [] })
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Nhóm', dataIndex: 'groupName', render: (n: string) => n || '-' },
    { title: 'GVHD', dataIndex: 'supervisorName', render: (n: string) => n || '-' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Topic) => (
        <Space>
          <Button icon={<TagsOutlined />} onClick={() => openTagModal(record)} size="small" title="Gán tags" />
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa đề tài "${record.title}"?`,
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
      title="Quản lý đề tài"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm đề tài
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={topics}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? 'Chỉnh sửa đề tài' : 'Thêm đề tài'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={600}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input placeholder="Tên đề tài" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          {!editingId && (
          <Form.Item name="keywords" label="Từ khóa (Keywords)">
            <Select
              mode="tags"
              placeholder="Nhập keywords (nhấn Enter sau mỗi từ)"
            />
          </Form.Item>
          )}
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
      <Modal
        title="Gán tags cho đề tài"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        onOk={onAssignTags}
        okText="Lưu"
      >
        <Form form={tagForm} layout="vertical">
          <Form.Item name="keywords" label="Từ khóa (Keywords)">
            <Select
              mode="tags"
              placeholder="Nhập keywords (nhấn Enter sau mỗi từ)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
