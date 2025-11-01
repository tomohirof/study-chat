import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatHistoryService } from '@/services/ChatHistoryService'
import { StorageRepository } from '@/storage/StorageRepository'
import type { ChatMessage } from '@/api/types'

describe('ChatHistoryService', () => {
  let service: ChatHistoryService
  let mockStorage: StorageRepository

  beforeEach(() => {
    // ストレージをクリア
    localStorage.clear()

    mockStorage = new StorageRepository()
    vi.spyOn(mockStorage, 'save')
    vi.spyOn(mockStorage, 'load')
    vi.spyOn(mockStorage, 'clear')

    service = new ChatHistoryService(mockStorage)
  })

  describe('addMessage', () => {
    it('新しいメッセージを追加できる', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello',
      }

      service.addMessage(message)

      expect(mockStorage.save).toHaveBeenCalled()
      const history = service.getHistory()
      expect(history.messages).toHaveLength(1)
      expect(history.messages[0]).toEqual(message)
    })

    it('複数のメッセージを順番に追加できる', () => {
      const message1: ChatMessage = { role: 'user', content: 'Hello' }
      const message2: ChatMessage = { role: 'assistant', content: 'Hi there!' }

      service.addMessage(message1)
      service.addMessage(message2)

      const history = service.getHistory()
      expect(history.messages).toHaveLength(2)
      expect(history.messages[0]).toEqual(message1)
      expect(history.messages[1]).toEqual(message2)
    })
  })

  describe('getHistory', () => {
    it('空の履歴を取得できる', () => {
      const history = service.getHistory()

      expect(history.messages).toEqual([])
    })

    it('保存された履歴を取得できる', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test 1' },
        { role: 'assistant', content: 'Response 1' },
      ]

      messages.forEach(msg => service.addMessage(msg))

      const history = service.getHistory()
      expect(history.messages).toEqual(messages)
    })

    it('ストレージから既存の履歴を読み込める', () => {
      const existingMessages: ChatMessage[] = [
        { role: 'user', content: 'Existing message' },
      ]

      mockStorage.save('chat_history', { messages: existingMessages })

      const newService = new ChatHistoryService(mockStorage)
      const history = newService.getHistory()

      expect(history.messages).toEqual(existingMessages)
    })
  })

  describe('clearHistory', () => {
    it('履歴をクリアできる', () => {
      service.addMessage({ role: 'user', content: 'Test' })
      service.clearHistory()

      expect(mockStorage.save).toHaveBeenCalledWith('chat_history', {
        messages: [],
      })

      const history = service.getHistory()
      expect(history.messages).toEqual([])
    })
  })

  describe('getLastMessages', () => {
    it('最新のN件のメッセージを取得できる', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Message 1' },
        { role: 'assistant', content: 'Response 1' },
        { role: 'user', content: 'Message 2' },
        { role: 'assistant', content: 'Response 2' },
        { role: 'user', content: 'Message 3' },
      ]

      messages.forEach(msg => service.addMessage(msg))

      const lastTwo = service.getLastMessages(2)

      expect(lastTwo).toHaveLength(2)
      expect(lastTwo[0]).toEqual(messages[3])
      expect(lastTwo[1]).toEqual(messages[4])
    })

    it('メッセージ数が少ない場合は全件を返す', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Message 1' },
        { role: 'assistant', content: 'Response 1' },
      ]

      messages.forEach(msg => service.addMessage(msg))

      const lastFive = service.getLastMessages(5)

      expect(lastFive).toHaveLength(2)
      expect(lastFive).toEqual(messages)
    })

    it('履歴が空の場合は空配列を返す', () => {
      const lastMessages = service.getLastMessages(3)

      expect(lastMessages).toEqual([])
    })
  })
})
