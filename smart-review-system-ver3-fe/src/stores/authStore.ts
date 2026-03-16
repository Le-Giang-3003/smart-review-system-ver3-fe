import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/types/api'
import { STORAGE_KEYS } from '@/constants'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  setAuth: (token: string, refreshToken: string, user: UserInfo) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        set({ token, refreshToken, user })
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        set({ token: null, refreshToken: null, user: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'smart-review-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
