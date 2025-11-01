import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatApiClient } from '@/api/ChatApiClient'
import type { ChatMessage, ChatCompletionResponse } from '@/api/types'

describe('ChatApiClient', () => {
  let client: ChatApiClient
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    client = new ChatApiClient(mockApiKey)
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('正常なレスポンスを返す', async () => {
      const mockResponse: ChatCompletionResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'こんにちは!',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'こんにちは' },
      ]

      const result = await client.sendMessage(messages)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockApiKey}`,
          },
          body: expect.stringContaining('"messages"'),
        })
      )
    })

    it('APIエラー時に例外をスロー', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Invalid API key',
            type: 'invalid_request_error',
            code: 'invalid_api_key',
          },
        }),
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'test' },
      ]

      await expect(client.sendMessage(messages)).rejects.toThrow(
        'OpenAI API Error: Invalid API key'
      )
    })

    it('ネットワークエラー時に例外をスロー', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const messages: ChatMessage[] = [
        { role: 'user', content: 'test' },
      ]

      await expect(client.sendMessage(messages)).rejects.toThrow(
        'Network error'
      )
    })

    it('カスタムモデルとオプションを使用', async () => {
      const mockResponse: ChatCompletionResponse = {
        id: 'chatcmpl-456',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'test' },
      ]

      await client.sendMessage(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 100,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-4"'),
        })
      )
    })
  })
})
