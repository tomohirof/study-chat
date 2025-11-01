import type { ChatMessage } from '@/api/types'
import type { StorageRepository } from '@/storage/StorageRepository'

const STORAGE_KEY = 'chat_history'

export interface ChatHistory {
  messages: ChatMessage[]
}

/**
 * チャット履歴を管理するサービス
 */
export class ChatHistoryService {
  private storage: StorageRepository
  private history: ChatHistory

  constructor(storage: StorageRepository) {
    this.storage = storage
    this.history = this.loadHistory()
  }

  /**
   * メッセージを履歴に追加
   */
  addMessage(message: ChatMessage): void {
    this.history.messages.push(message)
    this.saveHistory()
  }

  /**
   * 履歴を取得
   */
  getHistory(): ChatHistory {
    return { ...this.history, messages: [...this.history.messages] }
  }

  /**
   * 最新のN件のメッセージを取得
   */
  getLastMessages(count: number): ChatMessage[] {
    const messages = this.history.messages
    return messages.slice(Math.max(0, messages.length - count))
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.history = { messages: [] }
    this.saveHistory()
  }

  /**
   * ストレージから履歴を読み込み
   */
  private loadHistory(): ChatHistory {
    const loaded = this.storage.load<ChatHistory>(STORAGE_KEY)
    return loaded || { messages: [] }
  }

  /**
   * ストレージに履歴を保存
   */
  private saveHistory(): void {
    this.storage.save(STORAGE_KEY, this.history)
  }
}
