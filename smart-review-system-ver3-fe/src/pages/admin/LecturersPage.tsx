import { useState } from 'react'
import { Table, Button, Modal, Form, Select, Input, message, Tabs } from 'antd'
import { LinkOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lecturerService, semesterService } from '@/api/admin.service'
import { COMPATIBILITY_TYPE_LABELS } from '@/constants'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { LecturerCompatibility } from '@/types/entities'

export const LecturersPage = () => {
  const [compatModalOpen, setCompatModalOpen] = useState(false)
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [loadForm] = Form.useForm()
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: lecturers = [], isLoading } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await lecturerService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: compatibilities = [], isLoading: compatLoading } = useQuery({
    queryKey: ['lecturer-compatibilities'],
    queryFn: async () => {
      const res = await lecturerService.getCompatibilities()
      return res.data.data ?? []
    },
  })

  const createCompatMutation = useMutation({
    mutationFn: lecturerService.createCompatibility,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Thêm tương thích thành công')
        queryClient.invalidateQueries({ queryKey: ['lecturer-compatibilities'] })
        setCompatModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message)
      }
    },
  })

  const deleteCompatMutation = useMutation({
    mutationFn: lecturerService.deleteCompatibility,
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Xóa thành công')
        queryClient.invalidateQueries({ queryKey: ['lecturer-compatibilities'] })
      } else {
        message.error(res.data.message)
      }
    },
  })

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { lecturerId: number; semesterId: number; maxLoad: number } }) =>
      lecturerService.updateLoad(id, data),
    onSuccess: (res) => {
      if (res.data.isSuccess) {
        message.success('Cập nhật tải thành công')
        queryClient.invalidateQueries({ queryKey: ['lecturers'] })
        setLoadModalOpen(false)
        setSelectedLecturerId(null)
      } else {
        message.error(res.data.message)
      }
    },
  })

  const onCompatSubmit = () => {
    form.validateFields().then((values) => {
      createCompatMutation.mutate({
        lecturerAId: values.lecturerAId,
        lecturerBId: values.lecturerBId,
        compatibilityType: values.compatibilityType,
        reason: values.reason,
      })
    })
  }

  const onLoadSubmit = () => {
    loadForm.validateFields().then((values) => {
      if (selectedLecturerId) {
        updateLoadMutation.mutate({
          id: selectedLecturerId,
          data: {
            lecturerId: selectedLecturerId,
            semesterId: values.semesterId,
            maxLoad: values.maxLoad,
          },
        })
      }
    })
  }

  const lecturerColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Mã GV', dataIndex: 'lecturerCode' },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags: { tagName: string }[]) => tags?.map((t) => t.tagName).join(', ') || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? 'Hoạt động' : 'Tạm dừng'),
    },
  ]

  const compatColumns = [
    { title: 'Giảng viên A', dataIndex: 'lecturerAName' },
    { title: 'Giảng viên B', dataIndex: 'lecturerBName' },
    {
      title: 'Loại',
      dataIndex: 'compatibilityType',
      render: (t: number) => COMPATIBILITY_TYPE_LABELS[t] ?? t,
    },
    { title: 'Lý do', dataIndex: 'reason' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: LecturerCompatibility) => (
        <Button
          danger
          size="small"
          onClick={() => {
            Modal.confirm({
              title: 'Xóa tương thích?',
              onOk: () => deleteCompatMutation.mutate(record.id),
            })
          }}
        >
          Xóa
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper title="Quản lý giảng viên">
      <Tabs
        items={[
          {
            key: 'lecturers',
            label: 'Danh sách giảng viên',
            children: (
              <>
                <Table
                  columns={lecturerColumns}
                  dataSource={lecturers}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },
          {
            key: 'compatibilities',
            label: 'Ma trận tương thích',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={() => {
                      form.resetFields()
                      setCompatModalOpen(true)
                    }}
                  >
                    Thêm tương thích
                  </Button>
                </div>
                <Table
                  columns={compatColumns}
                  dataSource={compatibilities}
                  rowKey="id"
                  loading={compatLoading}
                  pagination={{ pageSize: 10 }}
                />
              </>
            ),
          },
        ]}
      />
      <Modal
        title="Thêm tương thích giảng viên"
        open={compatModalOpen}
        onCancel={() => setCompatModalOpen(false)}
        onOk={onCompatSubmit}
        okText="Thêm"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="lecturerAId" label="Giảng viên A" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn GV"
              options={lecturers.map((l) => ({ label: l.fullName, value: l.id }))}
            />
          </Form.Item>
          <Form.Item name="lecturerBId" label="Giảng viên B" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn GV"
              options={lecturers.map((l) => ({ label: l.fullName, value: l.id }))}
            />
          </Form.Item>
          <Form.Item name="compatibilityType" label="Loại" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Trung lập', value: 0 },
                { label: 'Whitelist', value: 1 },
                { label: 'Blacklist', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="reason" label="Lý do">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Cấu hình tải giảng viên"
        open={loadModalOpen}
        onCancel={() => setLoadModalOpen(false)}
        onOk={onLoadSubmit}
        okText="Lưu"
      >
        <Form form={loadForm} layout="vertical">
          <Form.Item name="semesterId" label="Học kỳ" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn học kỳ"
              options={semesters.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item name="maxLoad" label="Tải tối đa" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn tải"
              options={[1, 2, 3, 4, 5].map((n) => ({ label: `${n} đề tài`, value: n }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
