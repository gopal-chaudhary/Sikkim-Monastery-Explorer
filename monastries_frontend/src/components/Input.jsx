import React, { forwardRef } from 'react'
import { cn } from '../utils/cn'
import { Eye, EyeOff, Search, AlertCircle } from 'lucide-react'

const inputVariants = {
  default: 'input',
  filled: 'bg-secondary border-transparent focus:bg-primary focus:border-primary',
  flushed: 'border-transparent border-b border-primary rounded-none px-0 focus:border-accent',
  unstyled: 'bg-transparent border-none focus:ring-0 px-0'
}

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
}

export const Input = forwardRef(function Input({
  type = 'text',
  variant = 'default',
  size = 'md',
  error = '',
  label = '',
  placeholder = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) {
  const [showPassword, setShowPassword] = React.useState(false)
  const isPassword = type === 'password'
  const isSearch = type === 'search'
  const hasError = !!error

  const inputType = isPassword && showPassword ? 'text' : type
  const variantClass = inputVariants[variant]
  const sizeClass = inputSizes[size]

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {isSearch && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
        )}
        
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            variantClass,
            sizeClass,
            isSearch && 'pl-10',
            hasError && 'border-error focus:border-error focus:ring-error',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-error" />
        )}
      </div>
      
      {helperText && !hasError && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
      
      {hasError && (
        <p className="text-xs text-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
})

export function Textarea({
  variant = 'default',
  size = 'md',
  error = '',
  label = '',
  placeholder = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  ...props
}) {
  const hasError = !!error
  const variantClass = inputVariants[variant]
  const sizeClass = inputSizes[size]

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          variantClass,
          sizeClass,
          'resize-vertical',
          hasError && 'border-error focus:border-error focus:ring-error',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      />
      
      {helperText && !hasError && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
      
      {hasError && (
        <p className="text-xs text-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

export function Select({
  options = [],
  error = '',
  label = '',
  placeholder = 'Select an option',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const hasError = !!error

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-primary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <select
        disabled={disabled}
        className={cn(
          'input',
          hasError && 'border-error focus:border-error focus:ring-error',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {helperText && !hasError && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
      
      {hasError && (
        <p className="text-xs text-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
