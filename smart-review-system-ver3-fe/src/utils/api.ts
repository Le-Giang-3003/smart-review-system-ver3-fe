type PagedShape<T> = {
  items?: T[]
  pageNumber?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
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
