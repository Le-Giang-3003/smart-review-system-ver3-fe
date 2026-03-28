import { Alert, Card, Descriptions } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { studentApiService } from '@/api/student.service'
import { PageWrapper } from '@/components/common/PageWrapper'

export const StudentGroupPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard-group'],
    queryFn: async () => {
      const res = await studentApiService.getDashboard()
      return res.data.data
    },
  })

  return (
    <PageWrapper title="Nhóm của tôi">
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
