import React from 'react'
import { cn } from '../utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'border border-primary text-primary bg-transparent hover:bg-secondary hover:border-secondary',
  danger: 'bg-error text-white hover:bg-red-700',
  success: 'bg-success text-white hover:bg-green-700'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseClasses = 'btn'
  const variantClass = buttonVariants[variant]
  const sizeClass = buttonSizes[size]
  const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
  
  const IconComponent = icon

  return (
    <button
      className={cn(
        baseClasses,
        variantClass,
        sizeClass,
        disabledClass,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      
      {!loading && icon && iconPosition === 'left' && (
        <IconComponent className="w-4 h-4" />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <IconComponent className="w-4 h-4" />
      )}
    </button>
  )
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const IconComponent = icon

  return (
    <Button
      variant={variant}
      size="icon"
      loading={loading}
      disabled={disabled}
      className={cn('p-2', className)}
      {...props}
    >
      {!loading && <IconComponent className="w-4 h-4" />}
    </Button>
  )
}
