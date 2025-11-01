// OpenAI APIのリクエスト・レスポンス型定義

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image_url'
  image_url: {
    url: string
    detail?: 'auto' | 'low' | 'high'
  }
}

export type MessageContent = string | Array<TextContent | ImageContent>

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: MessageContent
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatApiError {
  error: {
    message: string
    type: string
    code: string | null
  }
}
