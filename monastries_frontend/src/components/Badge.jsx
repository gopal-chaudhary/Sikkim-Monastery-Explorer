import React from 'react'
import { cn } from '../utils/cn'

const badgeVariants = {
  default: 'bg-accent text-white',
  secondary: 'bg-secondary text-primary border border-primary',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  outline: 'border border-primary text-primary bg-transparent',
  ghost: 'text-secondary hover:bg-secondary'
}

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status, children, className = '', ...props }) {
  const statusVariants = {
    active: 'bg-success text-white',
    inactive: 'bg-secondary text-primary',
    pending: 'bg-warning text-white',
    error: 'bg-error text-white',
    verified: 'bg-info text-white',
    featured: 'bg-accent text-white'
  }

  return (
    <Badge
      variant={statusVariants[status] || 'default'}
      size="sm"
      className={cn('uppercase tracking-wide', className)}
      {...props}
    >
      {children || status}
    </Badge>
  )
}
