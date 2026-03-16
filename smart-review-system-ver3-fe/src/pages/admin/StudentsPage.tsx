import { useState, useRef } from 'react'
import { Table, Button, Space, Modal, Form, Input, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Student } from '@/types/entities'

export const StudentsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['students'] })

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await studentService.getAll()
      return res.data?.data?.items || res.data?.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
        message.success('Thêm sinh viên thành công')
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Thêm thất bại')
      }
      invalidate()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidate()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      studentService.update(id, data),
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
        message.success('Cập nhật thành công')
        setModalOpen(false)
        setEditingId(null)
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
    mutationFn: studentService.delete,
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

  const importMutation = useMutation({
    mutationFn: studentService.import,
    onSuccess: (res) => {
      if (res.data?.isSuccess !== false) {
        message.success('Import thành công')
      } else {
        message.error(res.data.message || 'Import thất bại')
      }
      invalidate()
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi import')
      invalidate()
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  })

  const openCreate = () => {
    form.resetFields()
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (record: Student) => {
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      studentCode: record.studentCode,
    })
    setEditingId(record.id)
    setModalOpen(true)
  }

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        studentCode: values.studentCode,
      }
      if (editingId) {
        updateMutation.mutate({ id: editingId, data: payload })
      } else {
        createMutation.mutate(payload)
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file)
    }
  }

  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'MSSV', dataIndex: 'studentCode' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Nhóm', dataIndex: 'groupName', render: (val: string) => val || '-' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Student) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Xác nhận xóa',
                content: `Xóa sinh viên "${record.fullName}"?`,
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
    <PageWrapper title="Quản lý sinh viên" extra={
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
          Thêm Sinh viên
        </Button>
      </Space>
    }>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 12 }}
      />

      <Modal
        title={editingId ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="studentCode" label="MSSV" rules={[{ required: true }]}>
            <Input placeholder="SE123456" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="abc@gmail.com" />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
