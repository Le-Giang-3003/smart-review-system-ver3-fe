import { Table, Space, Tag, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { groupService } from '@/api/admin.service'
import { GROUP_STATUS_LABELS } from '@/constants'
import { PageWrapper } from '@/components/common/PageWrapper'
import type { Group } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const GroupsPage = () => {
  const [searchText, setSearchText] = useState('')

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await groupService.getAll()
      return extractListFromApiData<Group>(res.data?.data)
    },
  })

  const filteredGroups = groups.filter((g: Group) => 
    g.groupName.toLowerCase().includes(searchText.toLowerCase()) ||
    (g.topicTitle && g.topicTitle.toLowerCase().includes(searchText.toLowerCase())) ||
    (g.leaderName && g.leaderName.toLowerCase().includes(searchText.toLowerCase()))
  )

  const columns = [
    { title: 'Tên nhóm', dataIndex: 'groupName' },
    { title: 'Trưởng nhóm', dataIndex: 'leaderName' },
    { 
      title: 'Đề tài', 
      dataIndex: 'topicTitle', 
      render: (val: string) => val || '-' 
    },
    { 
      title: 'Thành viên', 
      dataIndex: 'members', 
      render: (members: any[]) => members?.map(m => m.fullName).join(', ') || '-' 
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
