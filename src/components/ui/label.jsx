"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ✨ Label variants with beautiful styling
const labelVariants = cva(
  "flex items-center gap-2 font-medium select-none transition-all duration-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        // ✨ Default - Clean & professional
        default: "text-foreground hover:text-primary/90",
        
        // ✨ Ghost - Subtle & minimal
        ghost: "text-muted-foreground hover:text-foreground",
        
        // ✨ Outline - With border background
        outline: "text-foreground bg-card border border-border rounded-lg px-3 py-2 hover:border-primary/50",
        
        // ✨ Primary - Bold & prominent
        primary: "text-primary font-semibold hover:text-primary/90",
        
        // ✨ Destructive - For errors
        destructive: "text-destructive font-medium hover:text-destructive/90",
        
        // ✨ Success - For positive states
        success: "text-green-600 font-medium hover:text-green-700",
      },
      
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
      
      // ✨ Required field indicator
      required: {
        true: "after:content-['*'] after:text-destructive after:ml-0.5",
      },
      
      // ✨ Error state
      error: {
        true: "text-destructive",
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "default",
      required: false,
      error: false,
    },
  }
)

function Label({
  className,
  variant = "default",
  size = "default",
  required = false,
  error = false,
  children,
  ...props
}) {
  return (
    <LabelPrimitive
      data-slot="label"
      data-variant={variant}
      data-size={size}
      data-error={error || undefined}
      className={cn(
        labelVariants({ variant, size, required, error }),
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
      
      {/* ✨ Optional tooltip icon for help text */}
      {props.helpText && (
        <span className="ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-help" title={props.helpText}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      )}
    </LabelPrimitive>
  )
}

// ============ PRESET LABELS ============

/**
 * Required Label - For mandatory fields
 */
function RequiredLabel({ children, className, ...props }) {
  return (
    <Label required variant="primary" className={cn("font-semibold", className)} {...props}>
      {children}
    </Label>
  )
}

/**
 * Error Label - For validation errors
 */
function ErrorLabel({ children, className, ...props }) {
  return (
    <Label error variant="destructive" className={cn("text-xs", className)} {...props}>
      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {children}
    </Label>
  )
}

/**
 * Optional Label - For optional fields
 */
function OptionalLabel({ children, className, ...props }) {
  return (
    <Label variant="ghost" className={cn("text-xs", className)} {...props}>
      {children}
      <span className="text-muted-foreground ml-1">(optional)</span>
    </Label>
  )
}

/**
 * Section Label - For form sections
 */
function SectionLabel({ children, className, ...props }) {
  return (
    <Label size="lg" variant="primary" className={cn("text-base font-bold uppercase tracking-wide", className)} {...props}>
      {children}
    </Label>
  )
}

export { 
  Label, 
  // eslint-disable-next-line react-refresh/only-export-components
  labelVariants,
  // Preset labels
  RequiredLabel,
  ErrorLabel,
  OptionalLabel,
  SectionLabel,
}