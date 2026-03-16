import axios, { type AxiosError } from 'axios'
import { STORAGE_KEYS } from '@/constants'

const baseURL = import.meta.env.VITE_API_BASE_URL

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

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
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(apiClient(originalRequest))
              }
            },
            reject,
          })
        })
      }

      originalRequest!._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      if (!refreshToken) {
        isRefreshing = false
        forceLogout()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken)
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
        }
        processQueue(null, accessToken)
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        forceLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
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
