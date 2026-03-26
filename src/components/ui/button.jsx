"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ✨ Beautiful button variants with gradients, shadows & animations
const buttonVariants = cva(
  "group/button relative inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // ✨ Primary with gradient & glow
        default:
          "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] hover:brightness-105",
        
        // ✨ Soft outline with subtle hover
        outline:
          "border-2 border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:border-primary/50 hover:text-primary transition-all duration-300",
        
        // ✨ Soft secondary with gentle hover
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:shadow-md hover:shadow-secondary/20 transition-all duration-300",
        
        // ✨ Ghost with elegant hover
        ghost:
          "text-foreground/80 hover:bg-muted/50 hover:text-foreground hover:scale-[1.02] transition-all duration-300",
        
        // ✨ Destructive with pulse effect
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-destructive/40 hover:scale-[1.02] active:scale-[0.98] animate-pulse-slow",
        
        // ✨ Link with underline animation
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-all duration-200",
        
        // ✨ NEW: Soft gradient variant
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-300",
        
        // ✨ NEW: Glass morphism variant
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 hover:border-white/40 shadow-lg transition-all duration-300",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        xs: "h-7 px-3 py-1.5 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-4 py-2 text-sm rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 py-3 text-base rounded-2xl [&_svg:not([class*='size-'])]:size-5",
        xl: "h-14 px-8 py-4 text-lg rounded-2xl [&_svg:not([class*='size-'])]:size-6",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 rounded-xl [&_svg:not([class*='size-'])]:size-6",
      },
      // ✨ NEW: Loading state
      loading: {
        true: "relative !cursor-wait",
      },
      // ✨ NEW: Full width
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  fullWidth = false,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, loading, fullWidth, className })
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {/* ✨ Loading spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      
      {/* ✨ Button content with fade effect when loading */}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
      
      {/* ✨ Subtle shine effect on hover */}
      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover/button:translate-x-full transition-transform duration-700 ease-out rounded-xl pointer-events-none" />
    </Comp>
  )
}

// ✨ Export variants for custom styling
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }