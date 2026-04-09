"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react"

// ============================================
// SELECT ROOT
// ============================================
function Select({ ...props }) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

// ============================================
// SELECT GROUP
// ============================================
function SelectGroup({ className, ...props }) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

// ============================================
// SELECT VALUE
// ============================================
function SelectValue({ ...props }) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

// ============================================
// SELECT TRIGGER - Enhanced with gradients & shadows
// ============================================
function SelectTrigger({
  className,
  size = "default",
  variant = "default",
  loading = false,
  children,
  ...props
}) {
  const variants = {
    default: "border-border bg-card/50 hover:bg-card hover:border-primary/50 focus:border-primary focus:ring-primary/20",
    outline: "border-2 border-border hover:border-primary/50 focus:border-primary focus:ring-0 bg-transparent",
    filled: "border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary focus:ring-0",
    ghost: "border-transparent bg-transparent hover:bg-muted/50 focus:bg-muted focus:border-transparent",
  }

  const sizes = {
    sm: "h-8 text-xs rounded-lg px-2.5",
    default: "h-10 text-sm rounded-xl px-3.5",
    lg: "h-12 text-base rounded-2xl px-4.5",
  }

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/select-trigger relative flex w-full items-center justify-between gap-2",
        "transition-all duration-300 ease-out",
        "outline-none select-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "data-placeholder:text-muted-foreground/70",
        "dark:bg-input/30 dark:hover:bg-input/50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* ✨ Subtle gradient background on hover */}
      <span className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover/select-trigger:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* ✨ Content */}
      <span className="relative flex items-center gap-2 min-w-0">
        {children}
      </span>
      
      {/* ✨ Animated Chevron Icon */}
      <SelectPrimitive.Icon asChild>
        {loading ? (
          <Loader2 className="size-4 text-primary animate-spin shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform duration-300 group-data-[state=open]/select-trigger:rotate-180" />
        )}
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// ============================================
// SELECT CONTENT - Beautiful dropdown popover
// ============================================
function SelectContent({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // ✨ Base styles
          "relative z-50 max-h-64 min-w-32 overflow-hidden rounded-xl",
          "bg-popover text-popover-foreground",
          "shadow-lg shadow-black/10 ring-1 ring-border/50",
          "backdrop-blur-sm bg-card/95",
          
          // ✨ Smooth animations
          "duration-200 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          
          // ✨ Popper positioning
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          
          className
        )}
        position={position}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        {/* ✨ Scroll Up Button */}
        <SelectScrollUpButton />
        
        {/* ✨ Viewport with smooth scrolling */}
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "p-1",
            position === "popper" && "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        
        {/* ✨ Scroll Down Button */}
        <SelectScrollDownButton />
        
        {/* ✨ Subtle gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-popover to-transparent pointer-events-none" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

// ============================================
// SELECT LABEL - Category headers
// ============================================
function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
        "text-muted-foreground bg-muted/30",
        "sticky top-0 z-10 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

// ============================================
// SELECT ITEM - Enhanced with hover & selection states
// ============================================
function SelectItem({
  className,
  children,
  variant = "default",
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-variant={variant}
      className={cn(
        // ✨ Base styles
        "relative flex w-full cursor-default items-center gap-2",
        "rounded-lg py-2.5 px-3 text-sm",
        "outline-none select-none",
        "transition-all duration-200 ease-out",
        
        // ✨ Hover state
        "focus:bg-primary/10 focus:text-primary",
        "hover:bg-primary/5 hover:translate-x-0.5",
        
        // ✨ Selected state
        "data-[state=checked]:bg-primary/15 data-[state=checked]:text-primary",
        "data-[state=checked]:font-medium",
        
        // ✨ Disabled state
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        
        // ✨ Destructive variant
        variant === "destructive" && "focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/5",
        
        className
      )}
      {...props}
    >
      {/* ✨ Checkmark indicator with animation */}
      <span className="relative flex size-5 items-center justify-center shrink-0">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-primary transition-transform duration-200 animate-in zoom-in" />
        </SelectPrimitive.ItemIndicator>
      </span>
      
      {/* ✨ Item text with truncate support */}
      <SelectPrimitive.ItemText key={`item-text-${props.value}`} className="flex-1 min-w-0 truncate">
        {children}
      </SelectPrimitive.ItemText>
      
      {/* ✨ Optional badge slot */}
      {props.badge && (
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">
          {props.badge}
        </span>
      )}
    </SelectPrimitive.Item>
  )
}

// ============================================
// SELECT SEPARATOR
// ============================================
function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1 my-1.5 h-px",
        "bg-linear-to-r from-transparent via-border to-transparent",
        className
      )}
      {...props}
    />
  )
}

// ============================================
// SELECT SCROLL UP BUTTON
// ============================================
function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center",
        "bg-linear-to-b from-popover to-transparent py-2",
        "transition-opacity duration-200",
        "data-[state=visible]:opacity-100 data-[state=hidden]:opacity-0",
        className
      )}
      {...props}
    >
      <ChevronUp className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollUpButton>
  )
}

// ============================================
// SELECT SCROLL DOWN BUTTON
// ============================================
function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center",
        "bg-linear-to-t from-popover to-transparent py-2",
        "transition-opacity duration-200",
        "data-[state=visible]:opacity-100 data-[state=hidden]:opacity-0",
        className
      )}
      {...props}
    >
      <ChevronDown className="size-4 text-muted-foreground" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}