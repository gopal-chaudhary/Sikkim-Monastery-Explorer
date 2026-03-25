import React from 'react'
import { cn } from '../utils/cn'

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  interactive = false,
  padding = 'normal',
  ...props 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8'
  }

  const baseClasses = 'card'
  const hoverClasses = hover ? 'card-hover' : ''
  const interactiveClasses = interactive ? 'card-interactive' : ''
  const paddingClass = paddingClasses[padding] || paddingClasses.normal

  return (
    <div 
      className={cn(
        baseClasses,
        hoverClasses,
        interactiveClasses,
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={cn('text-xl font-semibold text-primary font-heading', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-secondary mt-1', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-primary', className)} {...props}>
      {children}
    </div>
  )
}
