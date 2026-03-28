/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL API (vd: `/api` hoặc `https://host/api`). Để trống → client dùng `/api`. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
