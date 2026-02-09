/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_WS_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
