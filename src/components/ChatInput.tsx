import React, { useState, FormEvent, useRef } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { cn } from '@/lib/utils'
import { fileToBase64, validateImageFile } from '@/lib/imageUtils'

export interface ChatInputProps {
  onSend: (message: string, imageDataUrl?: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'メッセージを入力...',
  className,
}) => {
  const [input, setInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像の検証
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || '画像の読み込みに失敗しました')
      return
    }

    try {
      const dataUrl = await fileToBase64(file)
      setImagePreview(dataUrl)
      setError(null)
    } catch (err) {
      setError('画像の読み込みに失敗しました')
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((input.trim() || imagePreview) && !disabled) {
      onSend(input.trim(), imagePreview || undefined)
      setInput('')
      setImagePreview(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* エラー表示 */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* 画像プレビュー */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="選択された画像"
            className="max-h-32 rounded-md border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />

        {/* 画像選択ボタン */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageSelect}
          className="hidden"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="画像を添付"
        >
          📎
        </Button>

        <Button
          type="submit"
          disabled={disabled || (!input.trim() && !imagePreview)}
        >
          送信
        </Button>
      </form>
    </div>
  )
}
