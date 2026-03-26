"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const inputVariants = {
  base: "flex w-full min-w-0 rounded-xl border bg-transparent px-3 py-2 text-base transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  
  variants: {
    variant: {
      default: "border-border bg-card/50 hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
      ghost: "border-transparent bg-transparent hover:bg-muted/50 focus:bg-muted/30 focus:border-primary/50 aria-invalid:border-destructive/30",
      outlined: "border-2 border-border hover:border-primary/50 focus:border-primary focus:ring-0 aria-invalid:border-destructive",
      filled: "border-0 border-b-2 border-border rounded-none px-0 py-2.5 focus:border-primary focus:ring-0 bg-transparent aria-invalid:border-destructive",
    },
    
    size: {
      sm: "h-7 px-2.5 py-1.5 text-sm file:h-5 file:text-xs",
      default: "h-9 px-3 py-2 text-base file:h-6",
      lg: "h-11 px-4 py-2.5 text-lg file:h-7 file:text-sm",
    },
    
    withIcon: {
      left: "pl-9",
      right: "pr-9",
    },
  },
  
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}

function Input({
  className,
  type = "text",
  variant = "default",
  size = "default",
  iconLeft,
  iconRight,
  error,
  ...props
}) {
  const [isFocused, setIsFocused] = React.useState(false)
  
  const inputRef = React.useRef(null)
  
  // Auto-focus handling
  React.useEffect(() => {
    if (props.autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [props.autoFocus])

  return (
    <div className="relative w-full">
      {/* Left Icon */}
      {iconLeft && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          {iconLeft}
        </span>
      )}
      
      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        data-variant={variant}
        data-size={size}
        data-error={error || undefined}
        className={cn(
          inputVariants.base,
          inputVariants.variants.variant[variant],
          inputVariants.variants.size[size],
          iconLeft && inputVariants.withIcon.left,
          iconRight && inputVariants.withIcon.right,
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          isFocused && "shadow-sm",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
      
      {/* Right Icon */}
      {iconRight && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          {iconRight}
        </span>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1 animate-fade-in">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============ PRESET INPUTS ============

/**
 * Search Input - With search icon
 */
function SearchInput({ className, ...props }) {
  return (
    <Input
      type="search"
      variant="default"
      iconLeft={<SearchIcon className="w-4 h-4" />}
      placeholder="Search..."
      className={cn("pr-9", className)}
      {...props}
    />
  )
}

/**
 * Password Input - With toggle visibility
 */
function PasswordInput({ className, showToggle = true, ...props }) {
  const [showPassword, setShowPassword] = React.useState(false)
  
  return (
    <Input
      type={showPassword ? "text" : "password"}
      variant="default"
      iconRight={
        showToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOffIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        ) : null
      }
      className={cn("pr-9", className)}
      {...props}
    />
  )
}

/**
 * Phone Input - With Kenyan format hint
 */
function PhoneInput({ className, ...props }) {
  return (
    <div className="relative">
      <Input
        type="tel"
        variant="default"
        iconLeft={<PhoneIcon className="w-4 h-4" />}
        placeholder="+254 XXX XXX XXX"
        pattern="^\+254[0-9]{9}$"
        className={cn("pl-9", className)}
        {...props}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
        Kenya
      </span>
    </div>
  )
}

/**
 * Currency Input - With KES prefix
 */
function CurrencyInput({ className, currency = "KES", ...props }) {
  return (
    <div className="relative">
      <Input
        type="number"
        variant="default"
        iconLeft={<span className="text-sm font-medium text-muted-foreground">{currency}</span>}
        placeholder="0.00"
        step="0.01"
        min="0"
        className={cn("pl-12", className)}
        {...props}
      />
    </div>
  )
}

// ============ ICON COMPONENTS ============

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

export { 
  Input, 
  // eslint-disable-next-line react-refresh/only-export-components
  inputVariants,
  // Preset inputs
  SearchInput,
  PasswordInput,
  PhoneInput,
  CurrencyInput,
}