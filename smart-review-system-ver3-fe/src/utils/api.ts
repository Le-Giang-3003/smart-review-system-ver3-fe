type PagedShape<T> = {
  items?: T[]
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
}

/** Lấy chuỗi lỗi hiển thị từ axios/ASP.NET (ApiResponse, ProblemDetails, ModelState). */
export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra'): string {
  const ax = error as {
    response?: { data?: unknown; status?: number }
    message?: string
  }
  const status = ax.response?.status
  if (status === 404) {
    return 'Không gọi được API (404). Kiểm tra VITE_API_BASE_URL phải kết thúc bằng /api và khi dev local nên dùng /api để Vite proxy tới backend.'
  }

  const data = ax.response?.data
  if (typeof data === 'string' && data.length > 0) {
    const trimmed = data.trim()
    if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
      return 'Server trả về HTML thay vì JSON (thường là sai URL hoặc 404). Kiểm tra base URL có /api và backend đang chạy.'
    }
  }

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const msg = typeof d.message === 'string' ? d.message.trim() : ''
    const detail = typeof d.detail === 'string' ? d.detail.trim() : ''
    const title = typeof d.title === 'string' ? d.title.trim() : ''

    if (msg && msg !== 'An internal server error occurred.') return msg
    if (detail) {
      const short = detail.length > 280 ? `${detail.slice(0, 280)}…` : detail
      if (msg === 'An internal server error occurred.') return short
      return msg ? `${msg} — ${short}` : short
    }
    if (msg) return msg
    if (title) return title

    const errs = d.errors
    if (Array.isArray(errs) && errs.length) {
      const first = errs.find((x): x is string => typeof x === 'string')
      if (first) return first
    }
    if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
      const flat = Object.values(errs as Record<string, unknown>)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .filter((x): x is string => typeof x === 'string')
      if (flat.length) return flat[0]!
    }
  }
  const m = ax.message
  if (typeof m === 'string' && m && !/^Request failed with status code \d+$/i.test(m)) return m
  return fallback
}

export function extractListFromApiData<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[]
  }

  if (data && typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    const maybeItems = (data as PagedShape<T>).items
    return Array.isArray(maybeItems) ? maybeItems : []
  }

  return []
}
