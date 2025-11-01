import React, { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ChatApiClient } from '@/api/ChatApiClient'
import { StorageRepository } from '@/storage/StorageRepository'
import { ChatHistoryService } from '@/services/ChatHistoryService'
import type { ChatMessage as ChatMessageType } from '@/api/types'

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // サービスの初期化
  const storage = useRef(new StorageRepository()).current
  const historyService = useRef(new ChatHistoryService(storage)).current
  const apiClient = useRef(
    new ChatApiClient(
      import.meta.env.VITE_OPENAI_API_KEY || '',
      import.meta.env.VITE_OPENAI_API_BASE_URL
    )
  ).current

  // 履歴の読み込み
  useEffect(() => {
    const history = historyService.getHistory()
    setMessages(history.messages)
  }, [historyService])

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // メッセージ送信
  const handleSendMessage = async (content: string, imageDataUrl?: string) => {
    // メッセージコンテンツの構築
    let messageContent: ChatMessageType['content']

    if (imageDataUrl) {
      // 画像がある場合は配列形式
      const contentParts = []
      if (content.trim()) {
        contentParts.push({ type: 'text' as const, text: content })
      }
      contentParts.push({
        type: 'image_url' as const,
        image_url: { url: imageDataUrl },
      })
      messageContent = contentParts
    } else {
      // テキストのみ
      messageContent = content
    }

    const userMessage: ChatMessageType = {
      role: 'user',
      content: messageContent,
    }

    // ユーザーメッセージを追加
    setMessages((prev) => [...prev, userMessage])
    historyService.addMessage(userMessage)

    setIsLoading(true)
    setError(null)

    try {
      // 画像がある場合は画像対応モデルを使用（gpt-4o or gpt-4o-mini）
      const model = imageDataUrl
        ? import.meta.env.VITE_OPENAI_VISION_MODEL || 'gpt-4o-mini'
        : import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'

      // システムプロンプトを追加（数式記法の指示）
      const systemMessage: ChatMessageType = {
        role: 'system',
        content: 'マークダウン形式で回答してください。数式を含む場合は、インライン数式は $...$ 、ブロック数式は $$...$$ の形式で記述してください。',
      }

      // 直近の会話のみをAPIに送信（トークン節約）
      // 最新10件のメッセージのみを使用
      const CONTEXT_LIMIT = 10
      const recentMessages = messages.slice(-CONTEXT_LIMIT)

      // メッセージリストを構築（システムメッセージ + 直近の会話 + 新しいメッセージ）
      const conversationMessages = [systemMessage, ...recentMessages, userMessage]

      // APIを呼び出し
      const response = await apiClient.sendMessage(
        conversationMessages,
        {
          model,
          max_tokens: imageDataUrl ? 16384 : undefined, // 画像対応モデルの場合はmax_tokensを設定
        }
      )

      let assistantMessage = response.choices[0].message

      // 数式記法を変換
      if (typeof assistantMessage.content === 'string') {
        let convertedContent = assistantMessage.content

        // 1. \[ ... \] を $$ ... $$ に変換（ブロック数式）
        convertedContent = convertedContent.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
          return `$$${formula}$$`
        })

        // 2. \( ... \) を $ ... $ に変換（インライン数式）
        convertedContent = convertedContent.replace(/\\\(([\s\S]*?)\\\)/g, (_match, formula) => {
          return `$${formula}$`
        })

        assistantMessage = {
          ...assistantMessage,
          content: convertedContent,
        }
      }

      // アシスタントの返信を追加
      setMessages((prev) => [...prev, assistantMessage])
      historyService.addMessage(assistantMessage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 履歴クリア
  const handleClearHistory = () => {
    if (window.confirm('チャット履歴をクリアしますか？')) {
      historyService.clearHistory()
      setMessages([])
      setError(null)
    }
  }

  // APIキーチェック
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>APIキーが設定されていません</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              .envファイルにVITE_OPENAI_API_KEYを設定してください。
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              詳細は.env.exampleを参照してください。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto h-screen flex flex-col">
        {/* 固定ヘッダー */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="text-3xl">💬</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              disabled={messages.length === 0}
              title="履歴クリア"
            >
              🗑️
            </Button>
          </div>
        </div>

        {/* メッセージエリア（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>メッセージを入力して会話を始めましょう</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground max-w-[80%] rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">●</div>
                        <div className="animate-pulse delay-75">●</div>
                        <div className="animate-pulse delay-150">●</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* 固定フッター（入力エリア） */}
        <div className="sticky bottom-0 z-10 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {/* エラー表示 */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}

            {/* 入力フォーム */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="メッセージを入力..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
