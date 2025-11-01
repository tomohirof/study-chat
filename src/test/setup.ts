import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// React Testing Libraryのクリーンアップ
afterEach(() => {
  cleanup()
})

// グローバルなモック設定
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// fetch APIのモック（必要に応じて）
global.fetch = vi.fn()
