import axios, { type AxiosError } from 'axios'
import { STORAGE_KEYS } from '@/constants'

/**
 * - Nếu `.env` có `VITE_API_BASE_URL` (vd: https://host/api) → dùng giá trị đó.
 * - Nếu không có / rỗng → `/api` để khớp proxy Vite (`vite.config` proxy `/api` → BE).
 * - URL tuyệt đối chỉ có host (path `/`) mà thiếu `/api` → tự thêm `/api` (tránh POST .../review-periods → 404).
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || String(raw).trim() === '') {
    return '/api'
  }
  let u = String(raw).trim().replace(/\/$/, '')
  if (/^https?:\/\//i.test(u)) {
    try {
      const { pathname } = new URL(u)
      if (pathname === '/' || pathname === '') {
        u = `${u}/api`
      }
    } catch {
      /* ignore */
    }
  }
  return u
}

export const apiBaseURL = resolveApiBaseUrl()

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      forceLogout()
    }
    return Promise.reject(error)
  }
)

function forceLogout() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  window.dispatchEvent(new Event('unauthorized'))
}
