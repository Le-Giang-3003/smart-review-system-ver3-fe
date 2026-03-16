import { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  App,
  Space,
  Alert,
} from 'antd'
import { FileAddOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { lecturerService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'

export const StudentTopicsPage = () => {
  const [search, setSearch] = useState('')
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['student-topics', search],
    queryFn: async () => {
      const res = await studentApiService.getTopics(search || undefined)
      return res.data.data ?? []
    },
  })

  const { data: lecturersData } = useQuery({
    queryKey: ['lecturers-for-topic'],
    queryFn: async () => {
      const res = await lecturerService.getAll('', '', 1, 500)
      const data = res.data.data
      if (Array.isArray(data)) return data
      return data?.items ?? []
    },
    enabled: registerModalOpen,
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['student-groups-for-topic'],
    queryFn: async () => {
      const res = await studentApiService.getMyGroup()
      return res.data.data ?? []
    },
    enabled: registerModalOpen,
  })

  const registerMutation = useMutation({
    mutationFn: studentApiService.registerTopicForGroup,
    onSuccess: () => {
      message.success('Đăng ký đề tài thành công')
      queryClient.invalidateQueries({ queryKey: ['student-topics'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      setRegisterModalOpen(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    },
  })

  const columns = [
    {
      title: 'Tên đề tài',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc?: string) => desc || '-',
    },
    {
      title: 'GVHD',
      dataIndex: 'supervisorName',
      render: (name?: string) => name || '-',
    },
    {
      title: 'Từ khóa',
      dataIndex: 'keywords',
      render: (keywords?: string[]) =>
        keywords && keywords.length > 0 ? (
          <Space wrap>
            {keywords.slice(0, 3).map((kw, idx) => (
              <Tag key={idx} color="orange">
                {kw}
              </Tag>
            ))}
            {keywords.length > 3 && <Tag>+{keywords.length - 3}</Tag>}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Nhóm đăng ký',
      dataIndex: 'groupName',
      render: (name?: string) =>
        name ? <Tag color="success">{name}</Tag> : <Tag color="default">Trống</Tag>,
    },
  ]

  const myGroup = groups.find((g: any) => g.members?.length > 0)

  return (
    <PageWrapper
      title="Đề tài"
      subtitle="Xem danh sách đề tài và đăng ký đề tài cho nhóm"
      extra={
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          onClick={() => setRegisterModalOpen(true)}
        >
          Đăng ký đề tài
        </Button>
      }
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#D6D3D1' }} />}
            placeholder="Tìm kiếm đề tài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={topics}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Đăng ký đề tài cho nhóm"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        footer={null}
        width={560}
      >
        {!myGroup && (
          <Alert
            message="Bạn cần tham gia nhóm trước khi đăng ký đề tài"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            registerMutation.mutate({
              groupId: myGroup?.id || values.groupId,
              title: values.title,
              description: values.description,
              supervisorId: values.supervisorId,
            })
          }}
          style={{ marginTop: 8 }}
        >
          {myGroup && (
            <Alert
              message={`Đăng ký cho nhóm: ${myGroup.groupName}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item
            name="title"
            label="Tên đề tài"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }]}
          >
            <Input placeholder="Nhập tên đề tài" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả đề tài (không bắt buộc)" />
          </Form.Item>
          <Form.Item
            name="supervisorId"
            label="Giảng viên hướng dẫn"
            rules={[{ required: true, message: 'Vui lòng chọn GVHD' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm giảng viên"
              optionFilterProp="label"
              options={(lecturersData || []).map((l: any) => ({
                label: `${l.fullName} (${l.lecturerCode})`,
                value: l.id,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={registerMutation.isPending}
                disabled={!myGroup}
              >
                Đăng ký
              </Button>
              <Button onClick={() => setRegisterModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}
