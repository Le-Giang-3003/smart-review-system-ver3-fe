import { useMemo, useState } from 'react'
import {
  Card,
  Button,
  Select,
  Table,
  Alert,
  App,
  Empty,
  Tag,
  Popconfirm,
  InputNumber,
  Form,
  Collapse,
  Drawer,
  Descriptions,
  Progress,
  Space,
} from 'antd'
import { ThunderboltOutlined, UndoOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { councilService, lecturerService, schedulingService, reviewPeriodService } from '@/api/admin.service'
import { formatDate, formatTime, normalizeReviewPeriodStatusKey } from '@/utils/format'
import { PageWrapper } from '@/components/common/PageWrapper'
import { isApiSuccess } from '@/types/api'
import type { CouncilDetail, Lecturer, SchedulingResult } from '@/types/entities'
import { extractListFromApiData } from '@/utils/api'

export const SchedulingPage = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | undefined>()
  const [detailSlotId, setDetailSlotId] = useState<number>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [weightsForm] = Form.useForm()
  const [overrideType, setOverrideType] = useState<'remove' | 'add' | 'swap'>('remove')
  const [overrideForm] = Form.useForm()
  const [chairmanLecturerId, setChairmanLecturerId] = useState<number>()
  const queryClient = useQueryClient()
  const { message } = App.useApp()

  const { data: periods = [] } = useQuery({
    queryKey: ['review-periods'],
    queryFn: async () => {
      const res = await reviewPeriodService.getAll()
      return res.data.data ?? []
    },
  })

  const { data: lecturers = [] } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await lecturerService.getAll()
      return extractListFromApiData<Lecturer>(res.data?.data)
    },
  })

  const { data: scheduleResult, isLoading: isResultLoading } = useQuery<SchedulingResult | null>({
    queryKey: ['scheduling-result', selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null
      const res = await schedulingService.getResult(selectedPeriodId)
      return res.data.data ?? null
    },
    enabled: !!selectedPeriodId,
  })

  const resetMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.reset(periodId),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Đã reset kết quả lên lịch')
        queryClient.setQueryData(['scheduling-result', selectedPeriodId], null)
      } else {
        message.error(res.data.message || 'Reset thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['review-periods'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Reset thất bại')
    },
  })

  const runMutation = useMutation({
    mutationFn: (periodId: number) => schedulingService.run(periodId),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Chạy thuật toán thành công')
        if (res.data.data) {
          queryClient.setQueryData(['scheduling-result', selectedPeriodId], res.data.data)
        }
      } else {
        message.error(res.data.message || 'Chạy thuật toán thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
      queryClient.invalidateQueries({ queryKey: ['review-periods'] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lên lịch thất bại')
    },
  })

  const saveWeightsMutation = useMutation({
    mutationFn: schedulingService.updateWeights,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Lưu trọng số thành công')
      } else {
        message.error(res.data.message || 'Lưu trọng số thất bại')
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const { data: councilDetail, isFetching: isCouncilLoading } = useQuery({
    queryKey: ['council-detail', detailSlotId],
    queryFn: async () => {
      if (!detailSlotId) return null
      const res = await councilService.getBySlot(detailSlotId)
      return (res.data?.data ?? null) as CouncilDetail | null
    },
    enabled: !!detailSlotId,
  })

  const assignChairmanMutation = useMutation({
    mutationFn: (payload: { councilId: number; lecturerId: number }) =>
      councilService.assignChairman(payload.councilId, payload.lecturerId),
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Chỉ định chairman thành công')
      } else {
        message.error(res.data.message || 'Chỉ định chairman thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['council-detail', detailSlotId] })
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const manualOverrideMutation = useMutation({
    mutationFn: schedulingService.manualOverride,
    onSuccess: (res) => {
      if (isApiSuccess(res.data)) {
        message.success('Cập nhật hội đồng thành công')
        overrideForm.resetFields()
      } else {
        message.error(res.data.message || 'Cập nhật hội đồng thất bại')
      }
      queryClient.invalidateQueries({ queryKey: ['council-detail', detailSlotId] })
      queryClient.invalidateQueries({ queryKey: ['scheduling-result', selectedPeriodId] })
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const selectedPeriod = periods.find((p: any) => p.id === selectedPeriodId)
  const periodStatusKey = normalizeReviewPeriodStatusKey(selectedPeriod?.status)

  const lecturerOptions = useMemo(
    () =>
      lecturers.map((lecturer) => ({
        label: `${lecturer.fullName} (${lecturer.lecturerCode})`,
        value: lecturer.id,
      })),
    [lecturers]
  )

  const councilMemberOptions = useMemo(
    () =>
      (councilDetail?.members ?? []).map((member) => ({
        label: `${member.fullName} (${member.lecturerCode})`,
        value: member.lecturerId,
      })),
    [councilDetail?.members]
  )

  const handleGenerate = () => {
    if (!selectedPeriodId) {
      message.warning('Chọn đợt review')
      return
    }
    if (periodStatusKey !== 'Scheduling') {
      message.warning('Chỉ chạy thuật toán khi đợt review ở trạng thái "Scheduling" (Đang lên lịch).')
      return
    }
    runMutation.mutate(selectedPeriodId)
  }

  const handleSaveWeights = async () => {
    const values = await weightsForm.validateFields()
    saveWeightsMutation.mutate({
      w1: values.w1,
      w2: values.w2,
      w3: values.w3,
      w4: values.w4,
      w5: values.w5,
    })
  }

  const openDetail = (slotId: number) => {
    setDetailSlotId(slotId)
    setDrawerOpen(true)
    setChairmanLecturerId(undefined)
  }

  const submitManualOverride = async () => {
    const values = await overrideForm.validateFields()
    if (!detailSlotId) return
    if (overrideType === 'remove') {
      manualOverrideMutation.mutate({
        reviewSlotId: detailSlotId,
        removeLecturerId: values.removeLecturerId,
      })
      return
    }
    if (overrideType === 'add') {
      manualOverrideMutation.mutate({
        reviewSlotId: detailSlotId,
        addLecturerId: values.addLecturerId,
      })
      return
    }
    manualOverrideMutation.mutate({
      reviewSlotId: detailSlotId,
      swapFromLecturerId: values.swapFromLecturerId,
      swapToLecturerId: values.swapToLecturerId,
    })
  }

  const sessionColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d: string) => formatDate(d),
    },
    {
      title: 'Thời gian',
      render: (_: unknown, r: any) => `${formatTime(r.startTime)} - ${formatTime(r.endTime)}`,
    },
    {
      title: 'Nhóm',
      dataIndex: 'groups',
      render: (groups: { groupName: string; topicTitle?: string }[]) =>
        groups?.length > 0
          ? groups.map((g) => g.groupName).join(', ')
          : '-',
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      render: (room: string) => room || 'Chưa xếp',
    },
    {
      title: 'Hội đồng',
      dataIndex: 'members',
      render: (members: { fullName: string; isChairman: boolean }[]) =>
        members?.length > 0
          ? members.map((m) => `${m.fullName}${m.isChairman ? ' (CT)' : ''}`).join(', ')
          : '-',
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      width: 80,
      render: (score: number) => score > 0 ? <Tag color="blue">{score.toFixed(2)}</Tag> : '-',
    },
  ]

  return (
    <PageWrapper title="Thuật toán lên lịch">
      <Card>
        <Collapse
          style={{ marginBottom: 16 }}
          items={[
            {
              key: 'weights',
              label: 'Cấu hình trọng số thuật toán',
              children: (
                <Form
                  form={weightsForm}
                  layout="vertical"
                  initialValues={{
                    w1: 0.3,
                    w2: 0.2,
                    w3: 0.25,
                    w4: 0.15,
                    w5: 0.1,
                  }}
                >
                  <Space wrap size={16}>
                    <Form.Item name="w1" label="W1 - Jaccard" rules={[{ required: true }]}>
                      <InputNumber min={0} max={1} step={0.05} />
                    </Form.Item>
                    <Form.Item name="w2" label="W2 - InstructorPresence" rules={[{ required: true }]}>
                      <InputNumber min={0} max={1} step={0.05} />
                    </Form.Item>
                    <Form.Item
                      name="w3"
                      label="W3 - ReviewInheritance"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={1} step={0.05} />
                    </Form.Item>
                    <Form.Item
                      name="w4"
                      label="W4 - HistoryDiff (penalty)"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={1} step={0.05} />
                    </Form.Item>
                    <Form.Item name="w5" label="W5 - LoadImbalance (penalty)" rules={[{ required: true }]}>
                      <InputNumber min={0} max={1} step={0.05} />
                    </Form.Item>
                  </Space>
                  <Button
                    type="primary"
                    onClick={handleSaveWeights}
                    loading={saveWeightsMutation.isPending}
                  >
                    Lưu trọng số
                  </Button>
                </Form>
              ),
            },
          ]}
        />
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select
            placeholder="Chọn đợt review"
            style={{ width: 300 }}
            value={selectedPeriodId}
            onChange={setSelectedPeriodId}
            options={periods.map((p: any) => ({
              label: `${p.name} (${p.status})`,
              value: p.id,
            }))}
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={runMutation.isPending}
            onClick={handleGenerate}
            disabled={!selectedPeriodId || periodStatusKey !== 'Scheduling'}
          >
            Chạy thuật toán
          </Button>
          <Popconfirm
            title="Reset kết quả lên lịch cho đợt này?"
            description="Thao tác này xóa kết quả phân lịch; bạn có thể chạy lại thuật toán sau."
            okText="Reset"
            cancelText="Hủy"
            disabled={!selectedPeriodId}
            onConfirm={() => selectedPeriodId && resetMutation.mutate(selectedPeriodId)}
          >
            <Button
              icon={<UndoOutlined />}
              loading={resetMutation.isPending}
              disabled={!selectedPeriodId}
            >
              Reset lịch
            </Button>
          </Popconfirm>
        </div>

        {selectedPeriod && periodStatusKey !== 'Scheduling' && (
          <Alert
            message={`Đợt review đang ở trạng thái "${selectedPeriod.status}". Theo quy trình BE, chuyển đợt sang "Scheduling" (Đang lên lịch) rồi mới chạy thuật toán phân lịch.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isResultLoading && <p>Đang tải kết quả...</p>}

        {scheduleResult && (
          <>
            <Alert
              message={`Thống kê: Tổng ${scheduleResult.totalSlots} slot | ${scheduleResult.scheduledSlots} đã xếp lịch | ${scheduleResult.unschedulableSlots} chưa xếp được`}
              description={
                scheduleResult.unschedulableReasons?.length > 0
                  ? scheduleResult.unschedulableReasons.map((r, i) => <div key={i}>• {r}</div>)
                  : scheduleResult.scheduledSlots === 0 && scheduleResult.totalSlots > 0
                    ? 'Không có slot nào xếp được. Hãy kiểm tra: (1) Các nhóm đã đăng ký slot chưa? (2) Giảng viên đã đăng ký slot chưa? (3) Mỗi slot cần ít nhất 2 giảng viên đăng ký.'
                    : scheduleResult.totalSlots === 0
                      ? 'Đợt review này chưa có slot nào. Vui lòng tạo slot trước.'
                      : undefined
              }
              type={
                scheduleResult.scheduledSlots > 0 && scheduleResult.unschedulableSlots === 0
                  ? 'success'
                  : scheduleResult.scheduledSlots > 0
                    ? 'warning'
                    : 'error'
              }
              showIcon
              style={{ marginBottom: 16 }}
            />

            {scheduleResult.assignments.length > 0 ? (
              <Table
                columns={sessionColumns}
                dataSource={scheduleResult.assignments}
                rowKey="reviewSlotId"
                pagination={{ pageSize: 10 }}
                onRow={(record) => ({
                  onClick: () => openDetail(record.reviewSlotId),
                })}
              />
            ) : (
              <Empty description="Chưa có phiên review nào được xếp lịch" />
            )}
          </>
        )}

        {selectedPeriodId && !isResultLoading && !scheduleResult && (
          <Empty description="Chưa có kết quả. Nhấn 'Chạy thuật toán' để bắt đầu." />
        )}
      </Card>
      <Drawer
        open={drawerOpen}
        width={900}
        onClose={() => setDrawerOpen(false)}
        title="Chi tiết hội đồng review"
      >
        {councilDetail ? (
          <>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Ngày">{formatDate(councilDetail.date)}</Descriptions.Item>
              <Descriptions.Item label="Giờ">
                {formatTime(councilDetail.startTime)} - {formatTime(councilDetail.endTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">{councilDetail.room || '-'}</Descriptions.Item>
            </Descriptions>

            <Card
              size="small"
              title="Giảng viên hội đồng"
              extra={
                <Space>
                  <Select
                    placeholder="Chọn chairman"
                    style={{ width: 260 }}
                    value={chairmanLecturerId}
                    onChange={setChairmanLecturerId}
                    options={councilMemberOptions}
                  />
                  <Button
                    type="primary"
                    onClick={() =>
                      councilDetail &&
                      chairmanLecturerId &&
                      assignChairmanMutation.mutate({
                        councilId: councilDetail.councilId,
                        lecturerId: chairmanLecturerId,
                      })
                    }
                    loading={assignChairmanMutation.isPending}
                    disabled={!chairmanLecturerId}
                  >
                    Chỉ định Chairman
                  </Button>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Table
                size="small"
                rowKey="lecturerId"
                pagination={false}
                dataSource={councilDetail.members}
                columns={[
                  { title: 'Họ tên', dataIndex: 'fullName' },
                  { title: 'Mã GV', dataIndex: 'lecturerCode', width: 120 },
                  {
                    title: 'Vai trò',
                    dataIndex: 'isChairman',
                    width: 120,
                    render: (value: boolean) =>
                      value ? <Tag color="gold">Chairman</Tag> : <Tag>Member</Tag>,
                  },
                  {
                    title: 'Chuyên môn',
                    dataIndex: 'expertises',
                    render: (value: string[]) => value?.join(', ') || '-',
                  },
                ]}
              />
            </Card>

            <Card size="small" title="Nhóm sinh viên" style={{ marginBottom: 16 }}>
              <Table
                size="small"
                rowKey="groupId"
                pagination={false}
                dataSource={councilDetail.groups}
                columns={[
                  { title: 'Nhóm', dataIndex: 'groupName' },
                  { title: 'Đề tài', dataIndex: 'topicTitle' },
                  {
                    title: 'Keywords',
                    dataIndex: 'topicKeywords',
                    render: (value: string[]) => value?.join(', ') || '-',
                  },
                  {
                    title: 'Jaccard',
                    dataIndex: 'jaccardScore',
                    width: 200,
                    render: (value: number) => (
                      <Progress percent={Math.round((value || 0) * 100)} size="small" />
                    ),
                  },
                ]}
              />
            </Card>

            <Card size="small" title="Manual Override">
              <Form
                form={overrideForm}
                layout="vertical"
                initialValues={{ type: 'remove' }}
                onValuesChange={(changed) => {
                  if (changed.type) setOverrideType(changed.type)
                }}
              >
                <Form.Item name="type" label="Loại thao tác">
                  <Select
                    options={[
                      { label: 'Loại bỏ giảng viên', value: 'remove' },
                      { label: 'Thêm giảng viên', value: 'add' },
                      { label: 'Hoán đổi giảng viên', value: 'swap' },
                    ]}
                  />
                </Form.Item>
                {overrideType === 'remove' && (
                  <Form.Item
                    name="removeLecturerId"
                    label="Giảng viên cần bỏ"
                    rules={[{ required: true }]}
                  >
                    <Select options={councilMemberOptions} />
                  </Form.Item>
                )}
                {overrideType === 'add' && (
                  <Form.Item name="addLecturerId" label="Giảng viên thêm vào" rules={[{ required: true }]}>
                    <Select options={lecturerOptions} />
                  </Form.Item>
                )}
                {overrideType === 'swap' && (
                  <Space style={{ width: '100%' }} size={12}>
                    <Form.Item
                      name="swapFromLecturerId"
                      label="Giảng viên hiện tại"
                      rules={[{ required: true }]}
                      style={{ flex: 1 }}
                    >
                      <Select options={councilMemberOptions} />
                    </Form.Item>
                    <Form.Item
                      name="swapToLecturerId"
                      label="Giảng viên thay thế"
                      rules={[{ required: true }]}
                      style={{ flex: 1 }}
                    >
                      <Select options={lecturerOptions} />
                    </Form.Item>
                  </Space>
                )}
                <Button
                  type="primary"
                  onClick={submitManualOverride}
                  loading={manualOverrideMutation.isPending}
                >
                  Thực hiện
                </Button>
              </Form>
            </Card>
          </>
        ) : (
          !isCouncilLoading && <Empty description="Không có dữ liệu hội đồng cho slot này" />
        )}
      </Drawer>
    </PageWrapper>
  )
}
