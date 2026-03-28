import { useState } from 'react'
import { Table, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { TopicListItem } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const StudentTopicsPage = () => {
  const [search, setSearch] = useState('')

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['student-topics', search],
    queryFn: async () => {
      const res = await studentApiService.getTopics({ search: search || undefined, pageSize: 100 })
      return extractListFromApiData<TopicListItem>(res.data?.data)
    },
  })

  const columns = [
    { title: 'Mã', dataIndex: 'topicCode', width: 110 },
    { title: 'Tên (EN)', dataIndex: 'titleEn' },
    { title: 'Tên (VI)', dataIndex: 'titleVi' },
    { title: 'GVHD 1', dataIndex: 'supervisor1Name' },
    { title: 'Nhóm', dataIndex: 'groupName', render: (v: string | null | undefined) => v || '—' },
  ]

  return (
    <PageWrapper title="Đề tài">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={topics}
        loading={isLoading}
        pagination={{ pageSize: 12 }}
      />
    </PageWrapper>
  )
}
