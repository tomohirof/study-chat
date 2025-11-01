import React from 'react'

export interface LogoProps {
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="学習チャットロゴ"
    >
      {/* 風車デザイン - 4つの三角形と中心の正方形 */}

      {/* 上の三角形（白） */}
      <path d="M 30 50 L 50 10 L 70 50 Z" fill="white" stroke="currentColor" strokeWidth="2" />

      {/* 右の三角形（黒） */}
      <path d="M 50 30 L 90 50 L 50 70 Z" fill="currentColor" />

      {/* 下の三角形（白） */}
      <path d="M 30 50 L 50 90 L 70 50 Z" fill="white" stroke="currentColor" strokeWidth="2" />

      {/* 左の三角形（黒） */}
      <path d="M 50 30 L 10 50 L 50 70 Z" fill="currentColor" />

      {/* 中心の正方形（黒） */}
      <rect x="42" y="42" width="16" height="16" fill="currentColor" />
    </svg>
  )
}
