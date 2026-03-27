import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checklistService, reviewPeriodService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { Checklist, ChecklistItem, ReviewPeriod } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const ChecklistsPage = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>()
  const [createOpen, setCreateOpen] = useState(false)
  const [itemOpen, setItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [createForm] = Form.useForm()
  const [itemForm] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return extractListFromApiData<ReviewPeriod>(res.data?.data)
    },
  })

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['checklists', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null
      const res = await checklistService.getByPeriod(selectedPeriodId)
      return (res.data?.data ?? null) as Checklist | null
    },
    enabled: !!selectedPeriodId,
  })

  const checklistItems = useMemo(
    () => [...(checklist?.items ?? [])].sort((a, b) => a.orderNo - b.orderNo),
    [checklist?.items]
  )

  const invalidateChecklist = () =>
    queryClient.invalidateQueries({ queryKey: ['checklists', selectedPeriodId] })

  const createChecklistMutation = useMutation({
    mutationFn: checklistService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Tạo checklist thành công')
        setCreateOpen(false)
        createForm.resetFields()
      } else {
        message.error(res.data.message || 'Tạo checklist thất bại')
      }
      invalidateChecklist()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateChecklist()
    },
  })

  const addItemMutation = useMutation({
    mutationFn: (payload: {
      checklistId: number
      data: { orderNo: number; title: string; description?: string; maxScore?: number }
    }) => checklistService.addItem(payload.checklistId, payload.data),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Thêm tiêu chí thành công')
        setItemOpen(false)
        setEditingItem(null)
        itemForm.resetFields()
      } else {
        message.error(res.data.message || 'Thêm tiêu chí thất bại')
      }
      invalidateChecklist()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateChecklist()
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: (payload: {
      itemId: number
      data: { title: string; description?: string; maxScore?: number; orderNo: number }
    }) => checklistService.updateItem(payload.itemId, payload.data),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật tiêu chí thành công')
        setItemOpen(false)
        setEditingItem(null)
        itemForm.resetFields()
      } else {
        message.error(res.data.message || 'Cập nhật tiêu chí thất bại')
      }
      invalidateChecklist()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateChecklist()
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: checklistService.deleteItem,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Xóa tiêu chí thành công')
      } else {
        message.error(res.data.message || 'Xóa tiêu chí thất bại')
      }
      invalidateChecklist()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateChecklist()
    },
  })

  const openCreateChecklist = () => {
    if (!selectedPeriodId) {
      message.warning('Vui lòng chọn đợt review trước')
      return
    }
    createForm.setFieldsValue({
      name: `Checklist đợt review #${selectedPeriodId}`,
    })
    setCreateOpen(true)
  }

  const submitCreateChecklist = async () => {
    const values = await createForm.validateFields()
    if (!selectedPeriodId) return
    createChecklistMutation.mutate({
      reviewPeriodId: selectedPeriodId,
      name: values.name,
    })
  }

  const openCreateItem = () => {
    itemForm.resetFields()
    itemForm.setFieldsValue({ orderNo: checklistItems.length + 1 })
    setEditingItem(null)
    setItemOpen(true)
  }

  const openEditItem = (item: ChecklistItem) => {
    itemForm.setFieldsValue({
      orderNo: item.orderNo,
      title: item.title,
      description: item.description,
      maxScore: item.maxScore,
    })
    setEditingItem(item)
    setItemOpen(true)
  }

  const submitItem = async () => {
    const values = await itemForm.validateFields()
    if (!checklist) return
    const payload = {
      orderNo: Number(values.orderNo),
      title: values.title,
      description: values.description,
      maxScore: values.maxScore == null ? undefined : Number(values.maxScore),
    }
    if (editingItem) {
      updateItemMutation.mutate({ itemId: editingItem.id, data: payload })
      return
    }
    addItemMutation.mutate({ checklistId: checklist.id, data: payload })
  }

  const columns = [
    { title: 'Thứ tự', dataIndex: 'orderNo', width: 100 },
    { title: 'Tiêu chí', dataIndex: 'title' },
    { title: 'Mô tả', dataIndex: 'description', render: (value?: string) => value || '-' },
    {
      title: 'Điểm tối đa',
      dataIndex: 'maxScore',
      width: 120,
      render: (value?: number) => (value == null ? '-' : value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: ChecklistItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditItem(record)} />
          <Popconfirm
            title="Xóa tiêu chí này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteItemMutation.mutate(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageWrapper title="Quản lý checklist đánh giá">
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Chọn đợt review"
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            style={{ width: 360 }}
            options={periods.map((period) => ({
              label: period.name,
              value: period.id,
            }))}
          />
          {!checklist && selectedPeriodId && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateChecklist}>
              Tạo Checklist
            </Button>
          )}
          {checklist && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateItem}>
              Thêm tiêu chí
            </Button>
          )}
        </Space>
      </Card>

      {!selectedPeriodId ? (
        <Empty description="Vui lòng chọn đợt review để quản lý checklist" />
      ) : !checklist ? (
        <Empty description="Đợt review này chưa có checklist" />
      ) : (
        <Card title={checklist.name} loading={isLoading}>
          <Table
            columns={columns}
            dataSource={checklistItems}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <Modal
        title="Tạo checklist"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={submitCreateChecklist}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={createChecklistMutation.isPending}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="Tên checklist" rules={[{ required: true }]}>
            <Input placeholder="Checklist vòng review 1" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingItem ? 'Cập nhật tiêu chí' : 'Thêm tiêu chí'}
        open={itemOpen}
        onCancel={() => {
          setItemOpen(false)
          setEditingItem(null)
        }}
        onOk={submitItem}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        confirmLoading={addItemMutation.isPending || updateItemMutation.isPending}
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item name="orderNo" label="Thứ tự" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="title" label="Tiêu chí" rules={[{ required: true }]}>
            <Input placeholder="Đánh giá nội dung thuyết trình" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="maxScore" label="Điểm tối đa">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
