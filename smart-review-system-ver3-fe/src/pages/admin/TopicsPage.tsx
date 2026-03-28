import { useState } from 'react'
import { Table, Space, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { topicService } from '@/api/admin.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { TopicListItem } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

/** BE chỉ mở GET `/topics` — trang xem danh sách. */
export const TopicsPage = () => {
  const [searchText, setSearchText] = useState('')

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics', searchText],
    queryFn: async () => {
      const res = await topicService.getAll({ search: searchText || undefined, pageSize: 100 })
      return extractListFromApiData<TopicListItem>(res.data?.data)
    },
  })

  const columns = [
    { title: 'Mã', dataIndex: 'topicCode', width: 120 },
    { title: 'Tên (EN)', dataIndex: 'titleEn' },
    { title: 'Tên (VI)', dataIndex: 'titleVi' },
    { title: 'GVHD 1', dataIndex: 'supervisor1Name' },
    { title: 'GVHD 2', dataIndex: 'supervisor2Name', render: (v: string | null | undefined) => v || '—' },
    { title: 'Nhóm', dataIndex: 'groupName', render: (v: string | null | undefined) => v || '—' },
  ]

  return (
    <PageWrapper
      title="Đề tài"
      subtitle="Dữ liệu chỉ đọc — tạo/cập nhật đề tài qua import hoặc luồng backend (không có REST CRUD)."
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo mã, tên, GVHD..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={topics}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
      />
    </PageWrapper>
  )
}
