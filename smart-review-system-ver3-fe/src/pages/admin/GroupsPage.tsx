import { Table, Space, Tag, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { groupService } from '@/api/admin.service'
import { GROUP_STATUS_LABELS } from '@/constants'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { GroupListItem } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const GroupsPage = () => {
  const [searchText, setSearchText] = useState('')

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await groupService.getAll({ pageSize: 500 })
      return extractListFromApiData<GroupListItem>(res.data?.data)
    },
  })

  const filteredGroups = groups.filter((g: GroupListItem) =>
    g.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
    (g.topicTitleEn && g.topicTitleEn.toLowerCase().includes(searchText.toLowerCase())) ||
    (g.leaderName && g.leaderName.toLowerCase().includes(searchText.toLowerCase()))
  )

  const columns = [
    { title: 'Tên nhóm', dataIndex: 'groupName' },
    { title: 'Trưởng nhóm', dataIndex: 'leaderName' },
    {
      title: 'Đề tài (EN)',
      dataIndex: 'topicTitleEn',
      render: (val: string | null | undefined) => val || '-',
    },
    { title: 'Mã đề tài', dataIndex: 'topicCode', render: (v: string | null | undefined) => v || '-' },
    {
      title: 'Số thành viên',
      dataIndex: 'memberCount',
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (s: string) => {
        let color = 'default'
        if (s === 'Ready') color = 'blue'
        if (s === 'Registered') color = 'cyan'
        if (s === 'InReview') color = 'orange'
        if (s === 'Completed') color = 'green'
        
        return <Tag color={color}>{GROUP_STATUS_LABELS[s] || s}</Tag>
      },
    },
  ]

  return (
    <PageWrapper title="Quản lý nhóm sinh viên">
      <Space style={{ marginBottom: 16 }}>
        <Input 
          placeholder="Tìm kiếm nhóm..." 
          prefix={<SearchOutlined />} 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>
      
      <Table
        columns={columns}
        dataSource={filteredGroups}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 12 }}
      />
    </PageWrapper>
  )
}
