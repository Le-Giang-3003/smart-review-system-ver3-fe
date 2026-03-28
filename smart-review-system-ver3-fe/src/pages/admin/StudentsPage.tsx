import { useState, useRef, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, App, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, FileZipOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService, semesterService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { Student, Semester } from '@/types/entities'
import { extractListFromApiData, getApiErrorMessage } from '@/utils/api'
import { ADMIN_LIST_API_PAGE_SIZE, ADMIN_LIST_TABLE_PAGINATION } from '@/constants'

export const StudentsPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [capstoneModalOpen, setCapstoneModalOpen] = useState(false)
  const [capstoneForm] = Form.useForm()
  const [capstoneFile, setCapstoneFile] = useState<File | null>(null)

  const excelFileInputRef = useRef<HTMLInputElement>(null)
  const capstoneFileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()
  const { modal, message } = App.useApp()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['students'] })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await semesterService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await studentService.getAll(undefined, 1, ADMIN_LIST_API_PAGE_SIZE)
      return extractListFromApiData<Student>(res.data?.data)
    },
  })

  useEffect(() => {
    if (!capstoneModalOpen || semesters.length === 0) return
    const active = semesters.find((s) => s.isActive)
    const current = capstoneForm.getFieldValue('semesterId') as number | undefined
    if (current == null && active) {
      capstoneForm.setFieldsValue({ semesterId: active.id })
    }
  }, [capstoneModalOpen, semesters, capstoneForm])

  const createMutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Thêm sinh viên thành công')
        setModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Thêm thất bại')
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
      studentService.update(id, data),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật thành công')
        setModalOpen(false)
        setEditingId(null)
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

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Xóa thành công')
      } else {
        message.error(res.data.message || 'Xóa thất bại')
      }
      invalidate()
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
      invalidate()
    },
  })

  const importExcelMutation = useMutation({
    mutationFn: studentService.import,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success(res.data.message || 'Import Excel thành công')
      } else {
        message.error(res.data.message || 'Import thất bại')
      }
      invalidate()
      if (excelFileInputRef.current) excelFileInputRef.current.value = ''
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
      invalidate()
      if (excelFileInputRef.current) excelFileInputRef.current.value = ''
    },
  })

  const capstoneImportMutation = useMutation({
    mutationFn: ({ semesterId, file }: { semesterId: number; file: File }) =>
      semesterService.importCapstone(semesterId, file),
    onSuccess: (res) => {
      const envelope = res.data
      if (isApiSuccess(envelope)) {
        message.success(envelope.message || 'Import đề tài thành công')
        setCapstoneModalOpen(false)
        setCapstoneFile(null)
        capstoneForm.resetFields()
        if (capstoneFileInputRef.current) capstoneFileInputRef.current.value = ''
      } else {
        message.error(envelope?.message || 'Import thất bại')
      }
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
    onError: (error: unknown) => {
      message.error(getApiErrorMessage(error))
    },
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

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importExcelMutation.mutate(file)
    }
  }

  const handleCapstoneFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setCapstoneFile(file ?? null)
  }

  const openCapstoneModal = () => {
    setCapstoneFile(null)
    if (capstoneFileInputRef.current) capstoneFileInputRef.current.value = ''
    const active = semesters.find((s: Semester) => s.isActive)
    capstoneForm.setFieldsValue({
      semesterId: active?.id ?? semesters[0]?.id,
    })
    setCapstoneModalOpen(true)
  }

  const submitCapstoneImport = () => {
    capstoneForm.validateFields().then((values) => {
      if (!capstoneFile) {
        message.warning('Vui lòng chọn file .zip hoặc .docx')
        return
      }
      capstoneImportMutation.mutate({
        semesterId: values.semesterId as number,
        file: capstoneFile,
      })
    })
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
          ref={excelFileInputRef}
          onChange={handleExcelFileUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => excelFileInputRef.current?.click()}
          loading={importExcelMutation.isPending}
        >
          Import Excel
        </Button>
        <input
          type="file"
          accept=".zip,.docx"
          style={{ display: 'none' }}
          ref={capstoneFileInputRef}
          onChange={handleCapstoneFileChange}
        />
        <Button icon={<FileZipOutlined />} onClick={openCapstoneModal}>
          Import đề tài (ZIP/Word)
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm Sinh viên
        </Button>
      </Space>
    }>
      <p style={{ marginBottom: 16, color: 'rgba(0,0,0,0.55)', fontSize: 13 }}>
        <strong>Import Excel:</strong> danh sách SV (.xlsx).{' '}
        <strong>Import đề tài:</strong> cùng Swagger — file .zip (nhiều .docx) hoặc một .docx, gắn với học kỳ để tạo nhóm / SV / đề tài.
      </p>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={isLoading}
        pagination={ADMIN_LIST_TABLE_PAGINATION}
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

      <Modal
        title="Import đề tài từ Word / ZIP"
        open={capstoneModalOpen}
        onCancel={() => {
          setCapstoneModalOpen(false)
          setCapstoneFile(null)
          if (capstoneFileInputRef.current) capstoneFileInputRef.current.value = ''
        }}
        onOk={submitCapstoneImport}
        confirmLoading={capstoneImportMutation.isPending}
        okText="Import"
        width={520}
      >
        <Form form={capstoneForm} layout="vertical">
          <Form.Item
            name="semesterId"
            label="Học kỳ"
            rules={[{ required: true, message: 'Chọn học kỳ' }]}
          >
            <Select
              placeholder="Chọn học kỳ"
              options={semesters.map((s) => ({
                value: s.id,
                label: `${s.code} — ${s.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="File">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button onClick={() => capstoneFileInputRef.current?.click()}>
                Chọn file .zip hoặc .docx
              </Button>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                {capstoneFile ? capstoneFile.name : 'Chưa chọn file'}
              </span>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
