import { useMemo, useState } from 'react'
import {
  App,
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { EyeOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { feedbackService } from '@/api/lecturer.service'
import { PageWrapper } from '@/components/common/PageWrapper'
import { FEEDBACK_STATUS_LABELS, SUGGESTION_LABELS } from '@/constants'
import { isApiSuccess } from '@/types/api'
import type { Feedback, FeedbackDetail, MyReviewSession, UpdateDetailItem } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'
import { formatDate, formatTime } from '@/utils/format'

export const LecturerFeedbackPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeFeedbackId, setActiveFeedbackId] = useState<number>()
  const [detailRows, setDetailRows] = useState<FeedbackDetail[]>([])
  const [overallComment, setOverallComment] = useState<string>()
  const [suggestion, setSuggestion] = useState<number>()
  const [readonlyMode, setReadonlyMode] = useState(false)
  const queryClient = useQueryClient()
  const { message, modal } = App.useApp()

  const invalidateSessions = () =>
    queryClient.invalidateQueries({ queryKey: ['my-review-sessions'] })
  const invalidateFeedback = () =>
    queryClient.invalidateQueries({ queryKey: ['feedback-detail', activeFeedbackId] })

  const { data: mySessions = [], isLoading, error: sessionsError } = useQuery({
    queryKey: ['my-review-sessions'],
    queryFn: async () => {
      const res = await feedbackService.getMySessions()
      if (!isApiSuccess(res.data)) {
        throw new Error(res.data.message || 'Không tải được danh sách phiên review')
      }
      return extractListFromApiData<MyReviewSession>(res.data?.data)
    },
  })

  const { isFetching: isFeedbackLoading } = useQuery({
    queryKey: ['feedback-detail', activeFeedbackId],
    queryFn: async () => {
      if (!activeFeedbackId) return null
      const res = await feedbackService.getById(activeFeedbackId)
      const data = (res.data?.data ?? null) as Feedback | null
      if (data) {
        setDetailRows([...(data.details ?? [])].sort((a, b) => a.orderNo - b.orderNo))
        setOverallComment(data.overallComment)
        setSuggestion(data.suggestion)
      }
      return data
    },
    enabled: !!activeFeedbackId,
  })

  const createFeedbackMutation = useMutation({
    mutationFn: feedbackService.create,
    onSuccess: (res) => {
      if (isApiSuccess(res.data) && res.data.data) {
        message.success('Tạo phiếu đánh giá thành công')
        setReadonlyMode(false)
        setActiveFeedbackId(res.data.data.id)
        setDrawerOpen(true)
      } else {
        message.error(res.data.message || 'Tạo phiếu đánh giá thất bại')
      }
      invalidateSessions()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateSessions()
    },
  })

  const updateDetailsMutation = useMutation({
    mutationFn: (payload: { id: number; details: UpdateDetailItem[] }) =>
      feedbackService.updateDetails(payload.id, payload.details),
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lưu chi tiết thất bại')
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: (payload: { id: number; overallComment?: string; suggestion?: number }) =>
      feedbackService.updateComment(payload.id, {
        overallComment: payload.overallComment,
        suggestion: payload.suggestion,
      }),
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lưu nhận xét thất bại')
    },
  })

  const submitMutation = useMutation({
    mutationFn: feedbackService.submit,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Nộp phiếu đánh giá thành công')
        setDrawerOpen(false)
      } else {
        message.error(res.data.message || 'Nộp phiếu đánh giá thất bại')
      }
      invalidateSessions()
      invalidateFeedback()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
      invalidateSessions()
      invalidateFeedback()
    },
  })

  const saveDraft = async () => {
    if (!activeFeedbackId) return
    const payloadDetails: UpdateDetailItem[] = detailRows.map((item) => ({
      checklistItemId: item.checklistItemId,
      score: item.score,
      comment: item.comment,
      isPassed: item.isPassed,
    }))
    const [detailsRes, commentRes] = await Promise.all([
      updateDetailsMutation.mutateAsync({ id: activeFeedbackId, details: payloadDetails }),
      updateCommentMutation.mutateAsync({
        id: activeFeedbackId,
        overallComment,
        suggestion,
      }),
    ])
    if (isApiSuccess(detailsRes.data) && isApiSuccess(commentRes.data)) {
      message.success('Lưu nháp thành công')
      invalidateSessions()
      invalidateFeedback()
      return
    }
    message.error(detailsRes.data.message || commentRes.data.message || 'Lưu nháp thất bại')
  }

  const submitFeedback = () => {
    if (!activeFeedbackId) return
    modal.confirm({
      title: 'Nộp chính thức phiếu đánh giá?',
      content: 'Sau khi nộp, bạn sẽ không thể chỉnh sửa phiếu này.',
      okText: 'Nộp',
      cancelText: 'Hủy',
      onOk: () => submitMutation.mutate(activeFeedbackId),
    })
  }

  const statusTag = (status?: number) => (
    <Tag color={status === 1 ? 'success' : 'processing'}>
      {FEEDBACK_STATUS_LABELS[status ?? 0] || 'Nháp'}
    </Tag>
  )

  const openFeedbackDrawer = (feedbackId: number, readonly: boolean) => {
    setReadonlyMode(readonly)
    setActiveFeedbackId(feedbackId)
    setDrawerOpen(true)
  }

  const detailColumns = useMemo(
    () => [
      { title: 'Thứ tự', dataIndex: 'orderNo', width: 90 },
      { title: 'Tiêu chí', dataIndex: 'itemTitle', width: 260 },
      {
        title: 'Điểm tối đa',
        dataIndex: 'maxScore',
        width: 110,
        render: (value?: number) => (value == null ? '-' : value),
      },
      {
        title: 'Điểm chấm',
        dataIndex: 'score',
        width: 130,
        render: (value: number | undefined, record: FeedbackDetail, index: number) => (
          <InputNumber
            value={value}
            min={0}
            max={record.maxScore}
            disabled={readonlyMode}
            style={{ width: '100%' }}
            onChange={(nextValue) => {
              setDetailRows((prev) =>
                prev.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, score: nextValue == null ? undefined : nextValue } : item
                )
              )
            }}
          />
        ),
      },
      {
        title: 'Đạt / Không đạt',
        dataIndex: 'isPassed',
        width: 130,
        render: (value: boolean | undefined, _: FeedbackDetail, index: number) => (
          <Switch
            checked={value}
            disabled={readonlyMode}
            onChange={(checked) => {
              setDetailRows((prev) =>
                prev.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, isPassed: checked } : item
                )
              )
            }}
          />
        ),
      },
      {
        title: 'Nhận xét',
        dataIndex: 'comment',
        render: (value: string | undefined, _: FeedbackDetail, index: number) => (
          <Input
            value={value}
            disabled={readonlyMode}
            onChange={(event) => {
              const nextComment = event.target.value
              setDetailRows((prev) =>
                prev.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, comment: nextComment } : item
                )
              )
            }}
          />
        ),
      },
    ],
    [readonlyMode]
  )

  const sessionColumns = [
    { title: 'Đợt review', dataIndex: 'reviewPeriodName' },
    { title: 'Round', dataIndex: 'round' },
    { title: 'Ngày', dataIndex: 'date', render: (value: string) => formatDate(value) },
    {
      title: 'Giờ',
      render: (_: unknown, record: MyReviewSession) =>
        `${formatTime(record.startTime)} - ${formatTime(record.endTime)}`,
    },
    { title: 'Phòng', dataIndex: 'room', render: (value?: string) => value || '-' },
    { title: 'Nhóm', dataIndex: 'groupName' },
    { title: 'Đề tài', dataIndex: 'topicTitle', render: (value?: string) => value || '-' },
    {
      title: 'Vai trò',
      dataIndex: 'isChairman',
      render: (value: boolean) => <Tag color={value ? 'gold' : 'default'}>{value ? 'Chairman' : 'Member'}</Tag>,
    },
    {
      title: 'Trạng thái feedback',
      dataIndex: 'feedbackStatus',
      render: (value: number | undefined) => (value == null ? <Tag>Chưa tạo</Tag> : statusTag(value)),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: MyReviewSession) => {
        if (!record.feedbackId) {
          return (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => createFeedbackMutation.mutate(record.reviewSessionId)}
              loading={createFeedbackMutation.isPending}
            >
              Tạo phiếu đánh giá
            </Button>
          )
        }
        if (record.feedbackStatus === 1) {
          return (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openFeedbackDrawer(record.feedbackId!, true)}
            >
              Xem
            </Button>
          )
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<FormOutlined />}
            onClick={() => openFeedbackDrawer(record.feedbackId!, false)}
          >
            Chấm điểm
          </Button>
        )
      },
    },
  ]

  const saving =
    updateDetailsMutation.isPending || updateCommentMutation.isPending || submitMutation.isPending

  return (
    <PageWrapper title="Chấm điểm hội đồng">
      {sessionsError ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={(sessionsError as Error).message || 'Không tải được danh sách phiên review'}
        />
      ) : null}
      <Table
        columns={sessionColumns}
        dataSource={mySessions}
        rowKey="reviewSessionId"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={readonlyMode ? 'Xem phiếu đánh giá' : 'Chấm điểm phiên review'}
        width={1100}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          !readonlyMode && (
            <Space>
              <Button onClick={saveDraft} loading={saving}>
                Lưu nháp
              </Button>
              <Popconfirm
                title="Nộp chính thức phiếu đánh giá?"
                description="Sau khi nộp bạn sẽ không thể chỉnh sửa."
                okText="Nộp"
                cancelText="Hủy"
                onConfirm={submitFeedback}
              >
                <Button type="primary" loading={submitMutation.isPending}>
                  Nộp chính thức
                </Button>
              </Popconfirm>
            </Space>
          )
        }
      >
        <Table
          columns={detailColumns}
          dataSource={detailRows}
          rowKey="id"
          loading={isFeedbackLoading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Nhận xét tổng">
            <Input.TextArea
              rows={4}
              value={overallComment}
              disabled={readonlyMode}
              onChange={(event) => setOverallComment(event.target.value)}
            />
          </Form.Item>
          <Form.Item label="Đề xuất">
            <Radio.Group
              value={suggestion}
              disabled={readonlyMode}
              onChange={(event) => setSuggestion(event.target.value)}
            >
              <Radio value={0}>{SUGGESTION_LABELS[0]}</Radio>
              <Radio value={1}>{SUGGESTION_LABELS[1]}</Radio>
              <Radio value={2}>{SUGGESTION_LABELS[2]}</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </PageWrapper>
  )
}
