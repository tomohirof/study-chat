import type { ChatMessage } from '@/api/types'

export interface ChatHistoryEntry {
  id: string
  timestamp: number
  messages: ChatMessage[]
}

export interface ChatHistory {
  entries: ChatHistoryEntry[]
}
