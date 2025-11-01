import React from 'react'

export interface LogoProps {
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: '6px',
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: size * 0.7,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        C
      </span>
    </div>
  )
}
