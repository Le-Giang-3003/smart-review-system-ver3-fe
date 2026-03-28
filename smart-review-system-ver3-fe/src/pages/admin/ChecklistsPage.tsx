import { Alert } from 'antd'
import { PageWrapper } from '@/components/common/PageWrapper'

/** Backend hiện không có `ChecklistsController` — giữ route để tránh gãy menu. */
export const ChecklistsPage = () => (
  <PageWrapper title="Checklist đánh giá">
    <Alert
      type="info"
      showIcon
      message="Chưa có API checklist trên backend v3"
      description="Các thao tác checklist/phiếu chấm chi tiết không được expose qua REST trong bản BE hiện tại. Khi backend bổ sung controller, có thể nối lại tại đây."
    />
  </PageWrapper>
)
