import type {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatApiError,
} from './types'

export interface SendMessageOptions {
  model?: string
  temperature?: number
  max_tokens?: number
}

export class ChatApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(
    apiKey: string,
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  async sendMessage(
    messages: ChatMessage[],
    options: SendMessageOptions = {}
  ): Promise<ChatCompletionResponse> {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens,
    } = options

    const requestBody: ChatCompletionRequest = {
      model,
      messages,
      temperature,
      ...(max_tokens && { max_tokens }),
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData: ChatApiError = await response.json()
        throw new Error(`OpenAI API Error: ${errorData.error.message}`)
      }

      const data: ChatCompletionResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }
}
