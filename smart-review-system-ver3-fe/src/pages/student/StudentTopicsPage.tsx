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
  Popconfirm,
} from 'antd'
import { FileAddOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { lecturerService } from '@/api/admin.service'
import { isApiSuccess } from '@/types/api'
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
  })

  const registerMutation = useMutation({
    mutationFn: studentApiService.registerTopicForGroup,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Đăng ký đề tài thành công')
        setRegisterModalOpen(false)
        form.resetFields()
      } else {
        message.error(res.data.message || 'Đăng ký thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['student-topics'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    },
  })

  const registerExistingMutation = useMutation({
    mutationFn: ({ topicId, groupId }: { topicId: number; groupId: number }) =>
      studentApiService.registerExistingTopicForGroup(topicId, groupId),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Đăng ký đề tài thành công')
      } else {
        message.error(res.data.message || 'Đăng ký thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['student-topics'] })
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['student-groups'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Đăng ký thất bại')
    },
  })

  const myGroup = groups.length > 0 ? groups[0] : undefined
  const groupHasTopic = myGroup?.topicTitle

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
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: unknown, record: any) => {
        if (record.groupId || record.groupName) return null
        if (!myGroup || groupHasTopic) return null

        return (
          <Popconfirm
            title="Đăng ký đề tài này?"
            description={`Nhóm "${myGroup.groupName}" sẽ đăng ký đề tài "${record.title}"`}
            onConfirm={() =>
              registerExistingMutation.mutate({
                topicId: record.id,
                groupId: myGroup.id,
              })
            }
            okText="Đăng ký"
            cancelText="Hủy"
          >
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              loading={registerExistingMutation.isPending}
            >
              Đăng ký
            </Button>
          </Popconfirm>
        )
      },
    },
  ]

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
          Đăng ký đề tài mới
        </Button>
      }
    >
      {!myGroup && (
        <Alert
          message="Bạn cần tham gia nhóm trước khi đăng ký đề tài"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {myGroup && groupHasTopic && (
        <Alert
          message={`Nhóm "${myGroup.groupName}" đã đăng ký đề tài: ${myGroup.topicTitle}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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
        title="Đăng ký đề tài mới cho nhóm"
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
        {myGroup && groupHasTopic && (
          <Alert
            message={`Nhóm đã đăng ký đề tài: ${myGroup.topicTitle}`}
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
          {myGroup && !groupHasTopic && (
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
                disabled={!myGroup || !!groupHasTopic}
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
