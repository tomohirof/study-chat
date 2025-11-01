import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageRepository } from '@/storage/StorageRepository'

describe('StorageRepository', () => {
  let storage: StorageRepository
  let mockLocalStorage: Storage

  beforeEach(() => {
    // localStorageのモック
    const store: Record<string, string> = {}
    mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length
      },
    }

    vi.stubGlobal('localStorage', mockLocalStorage)
    storage = new StorageRepository()
  })

  describe('save', () => {
    it('データを保存できる', () => {
      const testData = { name: 'test', value: 123 }
      storage.save('test-key', testData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      )
    })

    it('既存のデータを上書きできる', () => {
      storage.save('test-key', { value: 'first' })
      storage.save('test-key', { value: 'second' })

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'test-key',
        JSON.stringify({ value: 'second' })
      )
    })
  })

  describe('load', () => {
    it('保存されたデータを読み込める', () => {
      const testData = { name: 'test', value: 123 }
      storage.save('test-key', testData)

      const loaded = storage.load<typeof testData>('test-key')

      expect(loaded).toEqual(testData)
    })

    it('存在しないキーの場合nullを返す', () => {
      const loaded = storage.load('non-existent-key')

      expect(loaded).toBeNull()
    })

    it('無効なJSONの場合nullを返す', () => {
      mockLocalStorage.setItem('invalid-json', 'invalid json data')

      const loaded = storage.load('invalid-json')

      expect(loaded).toBeNull()
    })
  })

  describe('remove', () => {
    it('データを削除できる', () => {
      storage.save('test-key', { value: 'test' })
      storage.remove('test-key')

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key')
      expect(storage.load('test-key')).toBeNull()
    })

    it('存在しないキーの削除でもエラーにならない', () => {
      expect(() => storage.remove('non-existent-key')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('すべてのデータをクリアできる', () => {
      storage.save('key1', { value: 1 })
      storage.save('key2', { value: 2 })

      storage.clear()

      expect(mockLocalStorage.clear).toHaveBeenCalled()
      expect(storage.load('key1')).toBeNull()
      expect(storage.load('key2')).toBeNull()
    })
  })

  describe('型安全性', () => {
    interface TestData {
      id: number
      name: string
    }

    it('型付きデータの保存・読み込みができる', () => {
      const testData: TestData = { id: 1, name: 'test' }
      storage.save('typed-key', testData)

      const loaded = storage.load<TestData>('typed-key')

      expect(loaded).toEqual(testData)
      if (loaded) {
        expect(loaded.id).toBe(1)
        expect(loaded.name).toBe('test')
      }
    })
  })
})
