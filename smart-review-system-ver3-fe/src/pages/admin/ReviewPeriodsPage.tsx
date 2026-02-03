import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import { formatDate } from '@/utils/format'
import { PERIOD_STATUS_LABELS, REVIEW_ROUND_LABELS } from '@/constants'
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
    form.setFieldsValue({
      maxSlotsPerDay: 5,
      maxGroupsPerSlot: 3,
      reviewDurationMinutes: 45,
      minLecturersPerSlot: 4,
      maxLecturersPerSlot: 5,
      councilSize: 2,
      weightJaccard: 0.35,
      weightPreference: 0.1,
      weightInstructorPresence: 0.15,
      weightReviewInheritance: 0.15,
      weightHistoryDiff: 0.15,
      weightLoadImbalance: 0.1,
    })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (record: ReviewPeriod) => {
    form.setFieldsValue({
      semesterId: record.semesterId,
      name: record.name,
      reviewRound: record.reviewRound,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      description: record.description,
      maxSlotsPerDay: record.maxSlotsPerDay,
      maxGroupsPerSlot: record.maxGroupsPerSlot,
      reviewDurationMinutes: record.reviewDurationMinutes,
      minLecturersPerSlot: record.minLecturersPerSlot,
      maxLecturersPerSlot: record.maxLecturersPerSlot,
      councilSize: record.councilSize,
      lecturerRegistrationDeadline: record.lecturerRegistrationDeadline ? dayjs(record.lecturerRegistrationDeadline) : null,
      studentRegistrationDeadline: record.studentRegistrationDeadline ? dayjs(record.studentRegistrationDeadline) : null,
      weightJaccard: record.weightJaccard,
      weightPreference: record.weightPreference,
      weightInstructorPresence: record.weightInstructorPresence,
      weightReviewInheritance: record.weightReviewInheritance,
      weightHistoryDiff: record.weightHistoryDiff,
      weightLoadImbalance: record.weightLoadImbalance,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        semesterId: values.semesterId,
        name: values.name,
        reviewRound: values.reviewRound,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        description: values.description,
        maxSlotsPerDay: values.maxSlotsPerDay,
        maxGroupsPerSlot: values.maxGroupsPerSlot,
        reviewDurationMinutes: values.reviewDurationMinutes,
        minLecturersPerSlot: values.minLecturersPerSlot,
        maxLecturersPerSlot: values.maxLecturersPerSlot,
        councilSize: values.councilSize,
        lecturerRegistrationDeadline: values.lecturerRegistrationDeadline?.toISOString(),
        studentRegistrationDeadline: values.studentRegistrationDeadline?.toISOString(),
        weightJaccard: values.weightJaccard,
        weightPreference: values.weightPreference,
        weightInstructorPresence: values.weightInstructorPresence,
        weightReviewInheritance: values.weightReviewInheritance,
        weightHistoryDiff: values.weightHistoryDiff,
        weightLoadImbalance: values.weightLoadImbalance,
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
      dataIndex: 'reviewRound',
      render: (r: number) => REVIEW_ROUND_LABELS[r] ?? r,
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
      render: (s: number) => PERIOD_STATUS_LABELS[s] ?? s,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ReviewPeriod) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          {record.status === 0 && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => openMutation.mutate(record.id)}
              size="small"
            >
              Mở
            </Button>
          )}
          {record.status === 1 && (
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
          <Form.Item name="reviewRound" label="Vòng review" rules={[{ required: true }]}>
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
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Cấu hình">
            <Space wrap>
              <Form.Item name="maxSlotsPerDay" noStyle>
                <InputNumber min={1} max={10} addonBefore="Slots/ngày" style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="maxGroupsPerSlot" noStyle>
                <InputNumber min={1} max={5} addonBefore="Nhóm/slot" style={{ width: 120 }} />
              </Form.Item>
              <Form.Item name="councilSize" noStyle>
                <InputNumber min={1} max={5} addonBefore="HĐ" style={{ width: 100 }} />
              </Form.Item>
            </Space>
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
