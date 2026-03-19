import { useState, useRef } from 'react'
import { Table, Button, Space, Modal, Form, Select, Input, App, Tabs, Row, Col } from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, BuildOutlined 
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lecturerService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Lecturer } from '@/types/entities'
import { isApiSuccess } from '@/types/api'
import { extractListFromApiData } from '@/utils/api'

export const LecturersPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [compatModalOpen, setCompatModalOpen] = useState(false)
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null)
  
  const [form] = Form.useForm()
  const [compatForm] = Form.useForm()
  const [loadForm] = Form.useForm()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidateLecturers = () => queryClient.invalidateQueries({ queryKey: ['lecturers'] })
  const invalidateCompat = () => queryClient.invalidateQueries({ queryKey: ['lecturer-compatibilities'] })

  const { data: lecturers = [], isLoading } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await lecturerService.getAll()
      return extractListFromApiData<Lecturer>(res.data?.data)
    },
  })

  useQuery({
    queryKey: ['lecturer-compatibilities'],
    queryFn: async () => [],
  })

  const createMutation = useMutation({
    mutationFn: lecturerService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Thêm giảng viên thành công')
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Thêm thất bại')
      }
      invalidateLecturers()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateLecturers()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      lecturerService.update(id, data),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật thành công')
        setModalOpen(false)
        setEditingId(null)
      } else {
        message.error(res.data.message || 'Cập nhật thất bại')
      }
      invalidateLecturers()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateLecturers()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: lecturerService.delete,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Xóa thành công')
      } else {
        message.error(res.data.message || 'Xóa thất bại')
      }
      invalidateLecturers()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateLecturers()
    },
  })

  const importMutation = useMutation({
    mutationFn: lecturerService.import,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Import thành công')
      } else {
        message.error(res.data.message || 'Import thất bại')
      }
      invalidateLecturers()
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi import')
      invalidateLecturers()
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  })

  const createCompatMutation = useMutation({
    mutationFn: lecturerService.createCompatibility,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Thêm tương thích thành công')
        setCompatModalOpen(false)
        compatForm.resetFields()
      } else {
        message.error(res.data.message || 'Thêm thất bại')
      }
      invalidateCompat()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateCompat()
    },
  })

  const updateLoadMutation = useMutation({
    mutationFn: (data: { lecturerIds: number[]; minTopics: number; maxTopics: number }) =>
      lecturerService.batchUpdateWorkload(data.lecturerIds, data.minTopics, data.maxTopics),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật tải thành công')
        setLoadModalOpen(false)
        setSelectedLecturerId(null)
      } else {
        message.error(res.data.message || 'Cập nhật thất bại')
      }
      invalidateLecturers()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateLecturers()
    },
  })

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({ minTopics: 0, maxTopics: 3 })
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (record: Lecturer) => {
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      lecturerCode: record.lecturerCode,
      department: record.department,
      minTopics: record.minTopics,
      maxTopics: record.maxTopics,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        lecturerCode: values.lecturerCode,
        department: values.department,
        minTopics: Number(values.minTopics),
        maxTopics: Number(values.maxTopics),
      }
      if (editingId) {
        updateMutation.mutate({ id: editingId, data: payload })
      } else {
        createMutation.mutate(payload)
      }
    })
  }

  const onCompatSubmit = () => {
    compatForm.validateFields().then((values) => {
      createCompatMutation.mutate({
        lecturerAId: values.lecturerAId,
        lecturerBId: values.lecturerBId,
        level: values.compatibilityType,
      })
    })
  }

  const onLoadSubmit = () => {
    loadForm.validateFields().then((values) => {
      if (selectedLecturerId) {
        updateLoadMutation.mutate({
          lecturerIds: [selectedLecturerId],
          minTopics: 0,
          maxTopics: values.maxLoad,
        })
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file)
    }
  }

  const lecturerColumns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Mã GV', dataIndex: 'lecturerCode' },
    { title: 'Khoa/Bộ môn', dataIndex: 'department' },
    {
      title: 'Tải HD',
      render: (_: unknown, record: Lecturer) => `${record.minTopics} - ${record.maxTopics}`,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Lecturer) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button icon={<BuildOutlined />} title="Cấu hình tải" onClick={() => {
            setSelectedLecturerId(record.id)
            setLoadModalOpen(true)
          }} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa giảng viên "${record.fullName}"?`,
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
    <PageWrapper title="Quản lý giảng viên" extra={
      <Space>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileUpload} 
        />
        <Button 
          icon={<UploadOutlined />} 
          onClick={() => fileInputRef.current?.click()}
          loading={importMutation.isPending}
        >
          Import Excel
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm GV
        </Button>
      </Space>
    }>
      <Tabs
        items={[
          {
            key: 'lecturers',
            label: 'Danh sách giảng viên',
            children: (
              <Table
                columns={lecturerColumns}
                dataSource={lecturers}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 12 }}
              />
            ),
          },
          {
            key: 'compatibilities',
            label: 'Ma trận tương thích',
            children: (
              <>
                <div style={{ padding: '16px 8px', color: '#78716C' }}>
                  BE hiện tại chưa mở API tương thích giảng viên. Tab này đang được ẩn thao tác để tránh lỗi gọi API.
                </div>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingId ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lecturerCode" label="Mã GV" rules={[{ required: true }]}>
                <Input placeholder="GV001" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="abc@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNumber" label="Số điện thoại">
                <Input placeholder="0987..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Khoa/Bộ môn">
                <Input placeholder="Kỹ thuật Phần mềm" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minTopics" label="SV tối thiểu">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maxTopics" label="SV tối đa">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Thêm tương thích giảng viên"
        open={compatModalOpen}
        onCancel={() => setCompatModalOpen(false)}
        onOk={onCompatSubmit}
        confirmLoading={createCompatMutation.isPending}
        okText="Thêm"
      >
        <Form form={compatForm} layout="vertical">
          <Form.Item name="lecturerAId" label="Giảng viên A" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn GV"
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
              options={lecturers.map((l: any) => ({ label: l.fullName, value: l.id }))}
            />
          </Form.Item>
          <Form.Item name="lecturerBId" label="Giảng viên B" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn GV"
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
              options={lecturers.map((l: any) => ({ label: l.fullName, value: l.id }))}
            />
          </Form.Item>
          <Form.Item name="compatibilityType" label="Loại tương thích" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Trung lập', value: 'Normal' },
                { label: 'Whitelist (Nên cùng hội đồng)', value: 'Preferred' },
                { label: 'Blacklist (Tránh cùng hội đồng)', value: 'StrongIncompatible' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cấu hình tải giảng viên"
        open={loadModalOpen}
        onCancel={() => setLoadModalOpen(false)}
        onOk={onLoadSubmit}
        confirmLoading={updateLoadMutation.isPending}
        okText="Lưu"
      >
        <Form form={loadForm} layout="vertical">
          <Form.Item name="maxLoad" label="Số nhóm tối đa" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn số lượng nhóm"
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ label: `${n} đề tài (nhóm)`, value: n }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
