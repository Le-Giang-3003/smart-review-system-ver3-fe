import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { topicService, tagService } from '@/api/admin.service'
import { TOPIC_LEVEL_LABELS } from '@/constants'
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

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await tagService.getAll()
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
    mutationFn: ({ id, tagIds }: { id: number; tagIds: number[] }) =>
      topicService.assignTags(id, tagIds),
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
      level: record.level,
      isActive: record.isActive,
      maxGroups: record.maxGroups,
      requiredSkills: record.requiredSkills,
      expectedOutcomes: record.expectedOutcomes,
      tagIds: record.tags.map((t) => t.id),
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const openTagModal = (record: Topic) => {
    setSelectedTopicId(record.id)
    tagForm.setFieldsValue({ tagIds: record.tags.map((t) => t.id) })
    setTagModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        const payload = {
          id: editingId,
          title: values.title,
          description: values.description,
          level: values.level,
          isActive: values.isActive ?? true,
          maxGroups: values.maxGroups,
          requiredSkills: values.requiredSkills,
          expectedOutcomes: values.expectedOutcomes,
        }
        updateMutation.mutate({ id: editingId, data: payload })
      } else {
        const payload = {
          title: values.title,
          description: values.description,
          level: values.level,
          maxGroups: values.maxGroups,
          requiredSkills: values.requiredSkills,
          expectedOutcomes: values.expectedOutcomes,
          tagIds: values.tagIds ?? [],
        }
        createMutation.mutate(payload)
      }
    })
  }

  const onAssignTags = () => {
    tagForm.validateFields().then((values) => {
      if (selectedTopicId) {
        assignTagsMutation.mutate({ id: selectedTopicId, tagIds: values.tagIds ?? [] })
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title' },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      render: (l: number) => TOPIC_LEVEL_LABELS[l] ?? l,
    },
    { title: 'Số nhóm ĐK', dataIndex: 'registeredGroupsCount', width: 100 },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? 'Hoạt động' : 'Tạm dừng'),
    },
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
          <Form.Item name="level" label="Cấp độ" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Cơ bản', value: 0 },
                { label: 'Trung cấp', value: 1 },
                { label: 'Nâng cao', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="maxGroups" label="Số nhóm tối đa">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="requiredSkills" label="Kỹ năng yêu cầu">
            <Input placeholder="VD: Python, Machine Learning" />
          </Form.Item>
          <Form.Item name="expectedOutcomes" label="Kết quả mong đợi">
            <Input.TextArea rows={2} />
          </Form.Item>
          {editingId && (
            <Form.Item name="isActive" label="Trạng thái">
              <Select
                options={[
                  { label: 'Hoạt động', value: true },
                  { label: 'Tạm dừng', value: false },
                ]}
              />
            </Form.Item>
          )}
          {!editingId && (
          <Form.Item name="tagIds" label="Tags">
            <Select
              mode="multiple"
              placeholder="Chọn tags"
              options={tags.map((t) => ({ label: t.name, value: t.id }))}
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
          <Form.Item name="tagIds" label="Tags">
            <Select
              mode="multiple"
              placeholder="Chọn tags"
              options={tags.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
