import React from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/api/types'

export interface ChatMessageProps {
  message: ChatMessageType
  className?: string
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, className }) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser && 'justify-end',
        isAssistant && 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isUser && 'bg-primary text-primary-foreground',
          isAssistant && 'bg-muted text-foreground'
        )}
      >
        {isAssistant && (
          <div className="text-xs font-semibold mb-1 text-muted-foreground">
            AI Assistant
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  )
}
