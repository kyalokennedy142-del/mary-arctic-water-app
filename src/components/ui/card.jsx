"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Beautiful Card Component with variants, animations & accessibility
 */

const cardVariants = {
  default: "bg-card border border-border/50",
  elevated: "bg-card border border-border/30 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10",
  outlined: "bg-transparent border-2 border-border hover:border-primary/50",
  ghost: "bg-transparent hover:bg-muted/30",
  gradient: "bg-gradient-to-br from-primary/5 to-primary-light/5 border border-primary/20 hover:border-primary/40",
  glass: "bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40",
}

const cardSizes = {
  sm: "rounded-lg py-3 gap-3 px-3 text-sm",
  default: "rounded-xl py-4 gap-4 px-4 text-sm",
  lg: "rounded-2xl py-6 gap-6 px-6 text-base",
}

function Card({
  className,
  variant = "default",
  size = "default",
  interactive = false,
  ...props
}) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/card relative flex flex-col overflow-hidden transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        interactive && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        cardVariants[variant],
        cardSizes[size],
        "has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0",
        "*:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    >
      {/* ✨ Optional decorative shine effect on hover */}
      {interactive && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover/card:translate-x-full transition-transform duration-700 ease-out" />
      )}
      {props.children}
    </div>
  )
}

function CardHeader({
  className,
  bordered = true,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1",
        bordered && "border-b border-border/50 pb-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "group-data-[size=sm]/card:gap-2 group-data-[size=sm]/card:pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  gradient = false,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-semibold",
        gradient && "bg-linear-to-r from-primary to-primary-light bg-clip-text text-transparent",
        "group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-muted-foreground leading-relaxed",
        "group-data-[size=sm]/card:text-xs",
        className
      )}
      {...props}
    />
  )
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        "flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
}

function CardContent({
  className,
  padded = true,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        padded && "group-data-[size=sm]/card:px-3 group-data-[size=lg]/card:px-6",
        padded && "px-4",
        "flex-1",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({
  className,
  bordered = true,
  variant = "default",
  ...props
}) {
  const footerVariants = {
    default: "bg-muted/30",
    subtle: "bg-muted/10",
    primary: "bg-primary/5 border-primary/20",
    transparent: "bg-transparent",
  }

  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between gap-3",
        bordered && "border-t border-border/50",
        "rounded-b-xl",
        "group-data-[size=sm]/card:p-3 group-data-[size=lg]/card:p-6",
        "p-4",
        footerVariants[variant],
        className
      )}
      {...props}
    />
  )
}

// ============ PRESET CARD COMPONENTS ============

/**
 * Stat Card - For dashboard metrics
 */
function StatCard({ title, value, description, icon: Icon, trend, className, ...props }) {
  return (
    <Card variant="elevated" size="default" className={cn("hover:scale-[1.02]", className)} {...props}>
      <CardHeader bordered={false} className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
        {trend && (
          <div className={cn(
            "mt-2 text-xs font-medium inline-flex items-center gap-1 px-2 py-1 rounded-full",
            trend.value >= 0 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          )}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Product Card - For inventory/items
 */
function ProductCard({ product, onAddToCart, onView, className, ...props }) {
  return (
    <Card variant="elevated" size="default" interactive className={cn("group", className)} {...props}>
      {product.image && (
        <div className="aspect-square overflow-hidden rounded-t-xl bg-muted">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="space-y-2">
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">
            {product.price?.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
          </span>
          {product.stock !== undefined && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              product.stock > 10 ? "bg-green-100 text-green-700" :
              product.stock > 0 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            )}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter variant="subtle" className="gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          View
        </button>
        <button
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </CardFooter>
    </Card>
  )
}

/**
 * Action Card - For quick actions/buttons
 */
function ActionCard({ title, description, icon: Icon, action, className, ...props }) {
  return (
    <Card 
      variant="outlined" 
      size="default" 
      interactive 
      className={cn("text-center hover:border-primary", className)}
      {...props}
    >
      <CardContent className="py-6 space-y-4">
        {Icon && (
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="space-y-1">
          <CardTitle className="text-center">{title}</CardTitle>
          {description && (
            <CardDescription className="text-center">{description}</CardDescription>
          )}
        </div>
      </CardContent>
      {action && (
        <CardFooter variant="transparent" className="justify-center pb-4">
          {action}
        </CardFooter>
      )}
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  // Preset components
  StatCard,
  ProductCard,
  ActionCard,
}

// eslint-disable-next-line react-refresh/only-export-components
export { cardVariants, cardSizes }