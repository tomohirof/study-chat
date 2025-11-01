import React, { useState, FormEvent } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { cn } from '@/lib/utils'

export interface ChatInputProps {
  onSend: (message: string) => void
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex gap-2', className)}
    >
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !input.trim()}>
        送信
      </Button>
    </form>
  )
}
