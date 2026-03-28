import { Card, Collapse, Space, Spin, Table, Tag, Typography } from 'antd'
import { OrderedListOutlined } from '@ant-design/icons'
import type { RegisteredSlotsByPeriod } from '@/hooks/useRegisteredSlotPreferences'
import { formatDate, formatTime, formatWeekdayVi } from '@/utils/format'
import type { SlotPreferenceDto } from '@/types/entities'

const prefColumns = [
  {
    title: 'Ưu tiên',
    dataIndex: 'priority',
    width: 88,
    align: 'center' as const,
  },
  {
    title: 'Ngày',
    width: 120,
    render: (_: unknown, r: SlotPreferenceDto) => formatDate(r.slotDate),
  },
  {
    title: 'Thứ',
    width: 110,
    render: (_: unknown, r: SlotPreferenceDto) => formatWeekdayVi(r.slotDate),
  },
  {
    title: 'Giờ',
    render: (_: unknown, r: SlotPreferenceDto) =>
      `${formatTime(r.slotStartTime)} – ${formatTime(r.slotEndTime)}`,
  },
  {
    title: 'Phòng',
    dataIndex: 'slotRoom',
    width: 120,
    render: (v?: string | null) => v?.trim() || '—',
  },
]

type Props = {
  loading: boolean
  blocks: RegisteredSlotsByPeriod[]
  cardTitle: string
  /** Mô tả ngắn dưới tiêu đề (mặc định: giảng viên / cá nhân) */
  blurb?: string
}

const defaultBlurb =
  'Danh sách theo mức ưu tiên (1 = cao nhất). Thông tin lấy từ đăng ký slot của bạn trong từng đợt review.'

export function RegisteredSlotPreferencesSection({ loading, blocks, cardTitle, blurb }: Props) {
  if (loading) {
    return (
      <Card style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin tip="Đang tải slot đã đăng ký..." />
        </div>
      </Card>
    )
  }

  if (blocks.length === 0) {
    return null
  }

  return (
    <Card
      style={{ marginBottom: 24 }}
      title={
        <Space>
          <OrderedListOutlined style={{ color: '#F97316' }} />
          {cardTitle}
        </Space>
      }
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 16 }}>
        {blurb ?? defaultBlurb}
      </Typography.Paragraph>
      <Collapse
        bordered={false}
        defaultActiveKey={blocks.map((b) => String(b.reviewPeriodId))}
        items={blocks.map((block) => ({
          key: String(block.reviewPeriodId),
          label: (
            <Space wrap>
              <strong>{block.reviewPeriodName}</strong>
              {block.preferences.length === 5 ? (
                <Tag color="success">Đủ 5 slot</Tag>
              ) : (
                <Tag color="warning">Đã chọn {block.preferences.length}/5 slot</Tag>
              )}
            </Space>
          ),
          children: (
            <Table<SlotPreferenceDto>
              size="small"
              pagination={false}
              rowKey={(r) => `${r.reviewSlotId}-${r.priority}`}
              columns={prefColumns}
              dataSource={block.preferences}
            />
          ),
        }))}
      />
    </Card>
  )
}
