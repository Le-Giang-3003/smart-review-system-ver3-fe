import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, App } from 'antd'
import { PlusOutlined, EditOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { reviewPeriodService, semesterService } from '@/api/admin.service'
import {
  formatDate,
  formatReviewPeriodStatus,
  formatReviewRound,
  normalizeReviewPeriodStatusKey,
} from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { ReviewPeriod } from '@/types/entities'
import { extractListFromApiData, getApiErrorMessage } from '@/utils/api'

export const ReviewPeriodsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [semesterId, setSemesterId] = useState<number | undefined>()
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['review-periods'] })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['review-periods', semesterId],
    queryFn: async () => {
      if (!semesterId) return []
      const res = await reviewPeriodService.getBySemester(semesterId)
      return extractListFromApiData<ReviewPeriod>(res.data?.data)
    },
    enabled: !!semesterId,
  })

  const createMutation = useMutation({
    mutationFn: reviewPeriodService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Tạo đợt review thành công')
        setModalOpen(false)
        form.resetFields()
      } else {
        const errList = res.data.errors?.filter((x): x is string => typeof x === 'string')
        const detail = errList?.length ? errList.join('; ') : ''
        message.error(
          [res.data.message, detail].filter(Boolean).join(' — ') || 'Tạo thất bại'
        )
      }
      invalidate()
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
      invalidate()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      reviewPeriodService.update(id, data as { id: number; name: string; startDate: string; endDate: string }),
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
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
      invalidate()
    },
  })

  const transitionMutation = useMutation({
    mutationFn: ({ id, targetStatus }: { id: number; targetStatus: string }) =>
      reviewPeriodService.transitionStatus(id, targetStatus),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Chuyển trạng thái thành công')
      } else {
        message.error(res.data.message || 'Chuyển trạng thái thất bại')
      }
      invalidate()
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
      invalidate()
    },
  })

  const openCreate = () => {
    form.resetFields()
    if (semesterId) form.setFieldsValue({ semesterId })
    setEditingId(null)
    setModalOpen(true)
  }

  const orderToFormValue = (r: string | number | undefined): number => {
    if (typeof r === 'number' && !Number.isNaN(r)) return r
    if (typeof r === 'string') {
      const m = /^Round(\d+)$/i.exec(r.trim())
      if (m) return Number(m[1])
      const n = Number(r)
      if (!Number.isNaN(n)) return n
    }
    return 1
  }

  const openEdit = (record: ReviewPeriod) => {
    form.setFieldsValue({
      semesterId: record.semesterId,
      name: record.name,
      order: orderToFormValue(record.order ?? record.round),
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      // BE bind `DateTime` — gửi ISO có giờ để tránh lỗi deserialize JSON
      const startDate = `${values.startDate.format('YYYY-MM-DD')}T00:00:00`
      const endDate = `${values.endDate.format('YYYY-MM-DD')}T23:59:59`
      const semesterId = Number(values.semesterId)
      const order = Number(values.order)
      if (!Number.isFinite(semesterId) || semesterId < 1) {
        message.error('Học kỳ không hợp lệ')
        return
      }
      if (!Number.isFinite(order) || order < 1 || order > 3) {
        message.error('Thứ tự đợt phải là 1, 2 hoặc 3')
        return
      }
      if (editingId) {
        updateMutation.mutate({
          id: editingId,
          data: { id: editingId, name: String(values.name).trim(), startDate, endDate },
        })
      } else {
        createMutation.mutate({
          semesterId,
          name: String(values.name).trim(),
          order,
          startDate,
          endDate,
        })
      }
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Học kỳ', dataIndex: 'semesterCode' },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      render: (_: unknown, r: ReviewPeriod) => formatReviewRound(r.order ?? r.round ?? 1),
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
      render: (s: string | number) => formatReviewPeriodStatus(s),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ReviewPeriod) => {
        const s = normalizeReviewPeriodStatusKey(record.status)
        return (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
            {s === 'Draft' && (
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                onClick={() => transitionMutation.mutate({ id: record.id, targetStatus: 'Open' })}
                size="small"
              >
                Mở đăng ký
              </Button>
            )}
            {s === 'Open' && (
              <Button
                type="link"
                icon={<StopOutlined />}
                onClick={() => transitionMutation.mutate({ id: record.id, targetStatus: 'Scheduling' })}
                size="small"
              >
                Chốt đăng ký
              </Button>
            )}
            {s === 'Scheduling' && (
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                onClick={() => transitionMutation.mutate({ id: record.id, targetStatus: 'Scheduled' })}
                size="small"
              >
                Chốt lịch
              </Button>
            )}
            {s === 'Scheduled' && (
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                onClick={() => transitionMutation.mutate({ id: record.id, targetStatus: 'InProgress' })}
                size="small"
              >
                Bắt đầu review
              </Button>
            )}
            {s === 'InProgress' && (
              <Button
                type="link"
                icon={<StopOutlined />}
                onClick={() => transitionMutation.mutate({ id: record.id, targetStatus: 'Closed' })}
                size="small"
              >
                Kết thúc
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <PageWrapper
      title="Quản lý đợt review"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} disabled={!semesterId}>
          Thêm đợt review
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 12 }}>Chọn học kỳ:</span>
        <Select
          placeholder="Học kỳ"
          style={{ width: 280 }}
          value={semesterId}
          onChange={(v) => setSemesterId(v)}
          options={semesters.map((s: { id: number; name: string; code: string }) => ({
            label: `${s.code} — ${s.name}`,
            value: s.id,
          }))}
        />
      </div>

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
              disabled={!!editingId}
              placeholder="Chọn học kỳ"
              options={semesters.map((s: { id: number; name: string }) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="VD: Đợt review vòng 1" />
          </Form.Item>
          <Form.Item name="order" label="Thứ tự đợt (order)" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
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
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
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
