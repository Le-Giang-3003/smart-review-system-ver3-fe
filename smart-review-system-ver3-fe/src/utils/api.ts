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
  const data = ax.response?.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.message === 'string' && d.message.trim()) return d.message
    if (typeof d.detail === 'string' && d.detail.trim()) return d.detail
    if (typeof d.title === 'string' && d.title.trim()) return d.title
    const errs = d.errors
    if (errs && typeof errs === 'object') {
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
