import React from 'react'

type SpinnerProps = {
  size?: number
  color?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 22, color = '#60a5fa' }) => {
  const strokeWidth = 1.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const visibleArc = circumference * 0.2
  const offsetArc = circumference - visibleArc

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="animate-spin"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${visibleArc} ${offsetArc}`}
      />
    </svg>
  )
}

export default Spinner
