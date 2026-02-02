import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

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
