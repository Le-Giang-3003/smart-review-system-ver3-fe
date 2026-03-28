import { Alert, Card, Descriptions } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { PageWrapper } from '@/components/common/PageWrapper'

/** `GroupsController` BE chỉ có GET — không tạo/sửa nhóm qua FE. */
export const StudentGroupPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard-group'],
    queryFn: async () => {
      const res = await studentApiService.getDashboard()
      return res.data.data
    },
  })

  return (
    <PageWrapper title="Nhóm của tôi" subtitle="Thông tin đồng bộ từ dashboard (backend không mở API tạo/sửa nhóm)">
      <Alert
        style={{ marginBottom: 16 }}
        type="warning"
        showIcon
        message="Quản lý nhóm (mời thành viên, trạng thái) do giáo vụ/backend xử lý — không có POST/PUT /groups trên API hiện tại."
      />
      <Card loading={isLoading}>
        {data?.groupName ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Tên nhóm">{data.groupName}</Descriptions.Item>
            <Descriptions.Item label="Đề tài (mã)">{data.topicCode || '—'}</Descriptions.Item>
            <Descriptions.Item label="Đề tài (tên EN)">{data.topicTitle || '—'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Alert type="info" message="Bạn chưa được gán vào nhóm trong hệ thống." />
        )}
      </Card>
    </PageWrapper>
  )
}
