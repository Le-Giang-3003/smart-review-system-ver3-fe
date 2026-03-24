import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  PERIOD_STATUS_COLORS,
  PERIOD_STATUS_LABELS,
  PERIOD_STATUS_STRING_COLORS,
  PERIOD_STATUS_STRING_LABELS,
  REVIEW_ROUND_LABELS,
  REVIEW_ROUND_STRING_LABELS,
} from '@/constants'

export const formatDate = (date: string | Date, pattern = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: vi })
}

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: vi })
}

export const formatTime = (time: string): string => {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`
}

export function formatReviewPeriodStatus(status: string | number | undefined | null): string {
  if (status == null) return '-'
  if (typeof status === 'number') return PERIOD_STATUS_LABELS[status] ?? String(status)
  if (typeof status === 'string' && /^\d+$/.test(status)) {
    const n = Number(status)
    return PERIOD_STATUS_LABELS[n] ?? status
  }
  return PERIOD_STATUS_STRING_LABELS[status] ?? String(status)
}

export function reviewPeriodStatusColor(status: string | number | undefined | null): string {
  if (status == null) return 'default'
  if (typeof status === 'number') return PERIOD_STATUS_COLORS[status] ?? 'default'
  if (typeof status === 'string' && /^\d+$/.test(status)) {
    return PERIOD_STATUS_COLORS[Number(status)] ?? 'default'
  }
  return PERIOD_STATUS_STRING_COLORS[status] ?? 'default'
}

export function formatReviewRound(round: string | number | undefined | null): string {
  if (round == null) return '-'
  if (typeof round === 'number') return REVIEW_ROUND_LABELS[round] ?? `Vòng ${round}`
  if (typeof round === 'string' && round.startsWith('Round')) {
    return REVIEW_ROUND_STRING_LABELS[round] ?? round
  }
  const n = Number(round)
  if (!Number.isNaN(n)) return REVIEW_ROUND_LABELS[n] ?? `Vòng ${n}`
  return String(round)
}

const PERIOD_STATUS_BY_NUM: Record<number, string> = {
  0: 'Draft',
  1: 'Open',
  2: 'Scheduling',
  3: 'Scheduled',
  4: 'InProgress',
  5: 'Closed',
}

/** Chuẩn hóa status đợt review (số hoặc tên enum) để so sánh logic */
export function normalizeReviewPeriodStatusKey(status: string | number | undefined | null): string {
  if (status == null) return ''
  if (typeof status === 'number') return PERIOD_STATUS_BY_NUM[status] ?? String(status)
  if (typeof status === 'string' && /^\d+$/.test(status)) {
    const n = Number(status)
    return PERIOD_STATUS_BY_NUM[n] ?? status
  }
  return String(status)
}
