"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"  // ✅ Fixed import
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // ✅ Simplified base classes
  "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline:
          "border border-border text-foreground hover:bg-muted",
        success:
          "bg-green-100 text-green-700 border border-green-200",
        warning:
          "bg-yellow-100 text-yellow-700 border border-yellow-200",
        info:
          "bg-blue-100 text-blue-700 border border-blue-200",
      },
      size: {
        sm: "h-5 text-[10px] px-2",
        default: "h-6 text-xs px-2.5",
        lg: "h-7 text-sm px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "span"  // ✅ Fixed: Slot not Slot.Root

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }