import { useState, useRef } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  App,
  Row,
  Col,
  Tag,
  Tooltip,
  Radio,
  Tabs,
  Card,
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, BuildOutlined, TagsOutlined, 
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lecturerService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Lecturer } from '@/types/entities'
import { isApiSuccess } from '@/types/api'
import { extractListFromApiData } from '@/utils/api'
import { COMPATIBILITY_TYPE_LABELS } from '@/constants'

export const LecturersPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null)
  const [expertiseModalOpen, setExpertiseModalOpen] = useState(false)
  const [expertiseLecturer, setExpertiseLecturer] = useState<Lecturer | null>(null)
  const [compatibilityForm] = Form.useForm()
  
  const [form] = Form.useForm()
  const [loadForm] = Form.useForm()
  const [expertiseForm] = Form.useForm()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidateLecturers = () => queryClient.invalidateQueries({ queryKey: ['lecturers'] })

  const { data: lecturers = [], isLoading } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await lecturerService.getAll()
      return extractListFromApiData<Lecturer>(res.data?.data)
    },
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

  const updateExpertiseMutation = useMutation({
    mutationFn: ({ id, keywords }: { id: number; keywords: string[] }) =>
      lecturerService.upsertExpertise(id, keywords),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật chuyên môn thành công')
        setExpertiseModalOpen(false)
        setExpertiseLecturer(null)
        expertiseForm.resetFields()
      } else {
        message.error(res.data.message || 'Cập nhật chuyên môn thất bại')
      }
      invalidateLecturers()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateLecturers()
    },
  })

  const updateCompatibilityMutation = useMutation({
    mutationFn: (data: { lecturerAId: number; lecturerBId: number; level: string }) =>
      lecturerService.upsertCompatibility(data.lecturerAId, data.lecturerBId, data.level),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật tương thích thành công')
        compatibilityForm.resetFields(['lecturerBId'])
      } else {
        message.error(res.data.message || 'Cập nhật tương thích thất bại')
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
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

  const openExpertiseModal = (record: Lecturer) => {
    setExpertiseLecturer(record)
    expertiseForm.setFieldsValue({
      expertises: record.expertises ?? [],
    })
    setExpertiseModalOpen(true)
  }

  const onExpertiseSubmit = () => {
    if (!expertiseLecturer) return
    expertiseForm.validateFields().then((values) => {
      const keywords = (values.expertises || []).map((k: string) => k.trim()).filter((k: string) => k.length > 0)
      updateExpertiseMutation.mutate({ id: expertiseLecturer.id, keywords })
    })
  }

  const onCompatibilitySubmit = () => {
    compatibilityForm.validateFields().then((values) => {
      if (values.lecturerAId === values.lecturerBId) {
        message.warning('Vui lòng chọn 2 giảng viên khác nhau')
        return
      }
      updateCompatibilityMutation.mutate({
        lecturerAId: values.lecturerAId,
        lecturerBId: values.lecturerBId,
        level: values.level,
      })
    })
  }

  const lecturerColumns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Mã GV', dataIndex: 'lecturerCode' },
    { title: 'Khoa/Bộ môn', dataIndex: 'department' },
    {
      title: 'Chuyên môn',
      dataIndex: 'expertises',
      render: (expertises: string[] = []) => {
        if (!expertises.length) return <span style={{ color: '#A8A29E' }}>Chưa cấu hình</span>
        const [first, second, ...rest] = expertises
        const items = [first, second].filter(Boolean)
        return (
          <Space size={4} wrap>
            {items.map((e) => (
              <Tag key={e} color="orange">
                {e}
              </Tag>
            ))}
            {rest.length > 0 && (
              <Tooltip title={expertises.join(', ')}>
                <Tag color="default">+{rest.length}</Tag>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
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
          <Button
            icon={<TagsOutlined />}
            title="Chuyên môn"
            onClick={() => openExpertiseModal(record)}
            size="small"
          />
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
    <PageWrapper title="Quản lý giảng viên">
      <Tabs
        items={[
          {
            key: 'list',
            label: 'Danh sách',
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
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
                <Table
                  columns={lecturerColumns}
                  dataSource={lecturers}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{ pageSize: 12 }}
                />
              </>
            ),
          },
          {
            key: 'compatibility',
            label: 'Tương thích',
            children: (
              <Card>
                <Form
                  form={compatibilityForm}
                  layout="vertical"
                  initialValues={{ level: 'Normal' }}
                  style={{ maxWidth: 680 }}
                >
                  <Form.Item name="lecturerAId" label="Giảng viên A" rules={[{ required: true }]}>
                    <Select
                      placeholder="Chọn giảng viên A"
                      options={lecturers.map((lecturer) => ({
                        label: `${lecturer.fullName} (${lecturer.lecturerCode})`,
                        value: lecturer.id,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="lecturerBId" label="Giảng viên B" rules={[{ required: true }]}>
                    <Select
                      placeholder="Chọn giảng viên B"
                      options={lecturers.map((lecturer) => ({
                        label: `${lecturer.fullName} (${lecturer.lecturerCode})`,
                        value: lecturer.id,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="level" label="Mức tương thích" rules={[{ required: true }]}>
                    <Radio.Group>
                      <Space direction="vertical">
                        <Radio value="Normal">{COMPATIBILITY_TYPE_LABELS.Normal}</Radio>
                        <Radio value="Preferred">{COMPATIBILITY_TYPE_LABELS.Preferred}</Radio>
                        <Radio value="StrongIncompatible">
                          {COMPATIBILITY_TYPE_LABELS.StrongIncompatible}
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={onCompatibilitySubmit}
                    loading={updateCompatibilityMutation.isPending}
                  >
                    Cập nhật
                  </Button>
                </Form>
              </Card>
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

      <Modal
        title={expertiseLecturer ? `Cấu hình chuyên môn - ${expertiseLecturer.fullName}` : 'Cấu hình chuyên môn'}
        open={expertiseModalOpen}
        onCancel={() => {
          setExpertiseModalOpen(false)
          setExpertiseLecturer(null)
          expertiseForm.resetFields()
        }}
        onOk={onExpertiseSubmit}
        confirmLoading={updateExpertiseMutation.isPending}
        okText="Lưu"
      >
        <Form form={expertiseForm} layout="vertical">
          <Form.Item
            name="expertises"
            label="Chuyên môn (keyword)"
            tooltip="Nhập từ khóa chuyên môn, nhấn Enter sau mỗi từ"
          >
            <Select
              mode="tags"
              placeholder="Ví dụ: Trí tuệ nhân tạo, Xử lý ảnh, Hệ thống nhúng"
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
