import React from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType, MessageContent } from '@/api/types'

export interface ChatMessageProps {
  message: ChatMessageType
  className?: string
}

const renderContent = (content: MessageContent) => {
  if (typeof content === 'string') {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  // 配列の場合（テキストと画像の組み合わせ）
  return (
    <div className="space-y-2">
      {content.map((item, index) => {
        if (item.type === 'text') {
          return (
            <div key={index} className="whitespace-pre-wrap break-words">
              {item.text}
            </div>
          )
        }
        if (item.type === 'image_url') {
          return (
            <img
              key={index}
              src={item.image_url.url}
              alt="添付画像"
              className="max-w-full rounded-md border"
            />
          )
        }
        return null
      })}
    </div>
  )
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
        {renderContent(message.content)}
      </div>
    </div>
  )
}
