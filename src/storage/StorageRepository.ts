/**
 * localStorageを抽象化したリポジトリ
 * 将来的にバックエンドAPIに切り替えやすくするための抽象化層
 */
export class StorageRepository {
  /**
   * データを保存
   */
  save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`Failed to save data for key: ${key}`, error)
      throw error
    }
  }

  /**
   * データを読み込み
   */
  load<T>(key: string): T | null {
    try {
      const serialized = localStorage.getItem(key)
      if (serialized === null) {
        return null
      }
      return JSON.parse(serialized) as T
    } catch (error) {
      console.error(`Failed to load data for key: ${key}`, error)
      return null
    }
  }

  /**
   * データを削除
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove data for key: ${key}`, error)
      throw error
    }
  }

  /**
   * すべてのデータをクリア
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage', error)
      throw error
    }
  }
}
