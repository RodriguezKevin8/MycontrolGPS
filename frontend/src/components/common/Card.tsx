import React from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function Card({ title, subtitle, action, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="self-start sm:self-center">{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}

