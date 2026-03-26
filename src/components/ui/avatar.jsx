"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * Avatar Component - Professional & Beautiful
 * Supports: Image, Fallback, Badge, Group, Count
 */

// Size variants
const avatarSizes = {
  sm: "size-8 data-[size=sm]:size-6",
  default: "size-10 data-[size=default]:size-8",
  lg: "size-12 data-[size=lg]:size-10",
  xl: "size-16 data-[size=xl]:size-14",
}

const badgeSizes = {
  sm: "size-2 [&>svg]:size-1.5",
  default: "size-2.5 [&>svg]:size-2",
  lg: "size-3 [&>svg]:size-2.5",
  xl: "size-3.5 [&>svg]:size-3",
}

function Avatar({
  className,
  size = "default",
  showBadge = false,
  badgeContent,
  status = "online", // online, offline, busy, away
  ...props
}) {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  }

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative inline-flex shrink-0 select-none",
        "rounded-full ring-2 ring-border ring-offset-2 ring-offset-background",
        "transition-all duration-300 ease-out",
        "hover:ring-primary/50 hover:scale-105",
        avatarSizes[size],
        className
      )}
      {...props}
    >
      {props.children}
      
      {/* Status Badge */}
      {showBadge && (
        <span
          className={cn(
            "absolute bottom-0 right-0 z-10 rounded-full ring-2 ring-background",
            "transition-all duration-300",
            statusColors[status],
            badgeSizes[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
      
      {/* Custom Badge Content */}
      {badgeContent && (
        <span
          className={cn(
            "absolute bottom-0 right-0 z-10 flex items-center justify-center",
            "rounded-full bg-primary text-primary-foreground ring-2 ring-background",
            "transition-all duration-300",
            badgeSizes[size]
          )}
        >
          {badgeContent}
        </span>
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  src,
  alt = "Avatar",
  fallback,
  ...props
}) {
  const [hasError, setHasError] = React.useState(false)

  return (
    <>
      {!hasError && src ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className={cn(
            "aspect-square size-full rounded-full object-cover",
            "transition-opacity duration-300",
            "data-[state=loaded]:opacity-100 data-[state=loading]:opacity-0",
            className
          )}
          {...props}
        />
      ) : (
        <AvatarFallback fallback={fallback} alt={alt} />
      )}
    </>
  )
}

function AvatarFallback({
  className,
  fallback,
  alt = "Avatar",
  ...props
}) {
  const initials = React.useMemo(() => {
    if (!fallback && !alt) return "?"
    const name = fallback || alt
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [fallback, alt])

  const gradientColors = [
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
  ]

  const colorIndex = React.useMemo(
    () => initials.charCodeAt(0) % gradientColors.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initials]
  )

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        "bg-linear-to-br font-semibold text-white",
        "transition-all duration-300",
        "group-hover/avatar:scale-110",
        gradientColors[colorIndex],
        "group-data-[size=sm]/avatar:text-xs",
        "group-data-[size=default]/avatar:text-sm",
        "group-data-[size=lg]/avatar:text-base",
        "group-data-[size=xl]/avatar:text-lg",
        className
      )}
      {...props}
    >
      {initials}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarGroup({
  className,
  max = 4,
  total,
  children,
  ...props
}) {
  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement
  )
  const displayedChildren = validChildren.slice(0, max)
  const remaining = total ? total - max : validChildren.length - max

  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex items-center",
        "[-&>*:not(:first-child)]:-ml-3",
        "[&>*:not(:first-child)]:hover:z-10 [&>*:not(:first-child)]:hover:scale-110",
        "*:transition-all *:duration-300",
        "*:ring-2 *:ring-background",
        className
      )}
      {...props}
    >
      {displayedChildren}
      {remaining > 0 && <AvatarGroupCount count={remaining} size="default" />}
    </div>
  )
}

function AvatarGroupCount({
  className,
  count,
  size = "default",
  ...props
}) {
  return (
    <div
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        "bg-linear-to-br from-primary/90 to-primary font-semibold text-primary-foreground",
        "ring-2 ring-background transition-all duration-300",
        "hover:scale-110 hover:shadow-lg",
        avatarSizes[size],
        className
      )}
      {...props}
    >
      <span className="text-xs">+{count}</span>
    </div>
  )
}

// ============ PRESET AVATARS ============

/**
 * Customer Avatar - For customer pages
 */
function CustomerAvatar({ customer, size = "default", showStatus = false }) {
  const status = customer?.last_sale 
    // eslint-disable-next-line react-hooks/purity
    ? new Date(customer.last_sale) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ? "online"
      : "away"
    : "offline"

  return (
    <Avatar size={size} showBadge={showStatus} status={status}>
      <AvatarImage
        src={customer?.avatar}
        alt={customer?.name || "Customer"}
        fallback={customer?.name}
      />
    </Avatar>
  )
}

/**
 * Product Avatar - For product/stock pages
 */
function ProductAvatar({ product, size = "default" }) {
  const categoryIcons = {
    "water-bottles-filled": "💧",
    "water-refills": "🔄",
    packages: "📦",
    "water-pumps": "⚡",
    "empty-bottles": "🍶",
    accessories: "🔧",
  }

  return (
    <Avatar size={size}>
      <AvatarFallback fallback={product?.name || "Product"}>
        {categoryIcons[product?.category] || "📦"}
      </AvatarFallback>
    </Avatar>
  )
}

/**
 * Sales Avatar - For sales records
 */
function SalesAvatar({ sale, size = "sm" }) {
  return (
    <Avatar size={size}>
      <AvatarImage
        src={sale?.customer_avatar}
        alt={sale?.customer_name || "Customer"}
        fallback={sale?.customer_name}
      />
    </Avatar>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  CustomerAvatar,
  ProductAvatar,
  SalesAvatar,
}

// eslint-disable-next-line react-refresh/only-export-components
export { avatarSizes, badgeSizes }