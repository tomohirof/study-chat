import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType, MessageContent } from '@/api/types'

export interface ChatMessageProps {
  message: ChatMessageType
  className?: string
}

const renderContent = (content: MessageContent, isAssistant: boolean) => {
  if (typeof content === 'string') {
    // アシスタントの応答はマークダウンとしてレンダリング
    if (isAssistant) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // カスタムスタイリング
              h1: ({ ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
              h2: ({ ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
              h3: ({ ...props }) => <h3 className="text-base font-bold mb-1" {...props} />,
              p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
              li: ({ ...props }) => <li className="mb-1" {...props} />,
              code: ({ className, children, ...props }: any) => {
                const inline = !className
                return inline ? (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="block bg-muted p-2 rounded text-sm overflow-x-auto" {...props}>
                    {children}
                  </code>
                )
              },
              pre: ({ ...props }) => <pre className="mb-2" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )
    }
    // ユーザーのメッセージは通常のテキスト
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
        {renderContent(message.content, isAssistant)}
      </div>
    </div>
  )
}
