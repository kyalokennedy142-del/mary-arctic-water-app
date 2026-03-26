import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================
// TABLE - Enhanced with modern styling
// ============================================
function Table({
  className,
  variant = "default",
  striped = false,
  bordered = false,
  hoverable = true,
  ...props
}) {
  const variants = {
    default: "bg-card",
    elevated: "bg-card shadow-lg shadow-black/5",
    outline: "bg-card border-2 border-border",
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
  }

  return (
    <div 
      data-slot="table-container" 
      className={cn(
        "relative w-full overflow-x-auto rounded-xl",
        "transition-all duration-300",
        className
      )}
    >
      <table
        data-slot="table"
        data-variant={variant}
        data-striped={striped || undefined}
        data-bordered={bordered || undefined}
        data-hoverable={hoverable || undefined}
        className={cn(
          "w-full caption-bottom text-sm",
          "transition-all duration-300",
          variants[variant],
          striped && "[&_tbody_tr:nth-child(even)]:bg-muted/30",
          bordered && "[&_td]:border-b [&_td]:border-border/50 [&_th]:border-b [&_th]:border-border/50",
          className
        )}
        {...props} 
      />
    </div>
  )
}

// ============================================
// TABLE HEADER - Enhanced with gradient background
// ============================================
function TableHeader({
  className,
  variant = "default",
  ...props
}) {
  const variants = {
    default: "bg-gradient-to-r from-secondary/50 via-secondary/30 to-secondary/50",
    primary: "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
    dark: "bg-gradient-to-r from-muted/80 via-muted/60 to-muted/80",
    transparent: "bg-transparent",
  }

  return (
    <thead
      data-slot="table-header"
      data-variant={variant}
      className={cn(
        "[&_tr]:border-b [&_tr]:border-border/50",
        "sticky top-0 z-10 backdrop-blur-sm",
        "transition-all duration-300",
        variants[variant],
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE BODY - Enhanced with smooth transitions
// ============================================
function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        "transition-all duration-300",
        "divide-y divide-border/30",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE FOOTER - Enhanced styling
// ============================================
function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t-2 border-border/50 bg-linear-to-r from-muted/50 via-muted/30 to-muted/50",
        "font-semibold text-foreground",
        "[&>tr]:last:border-b-0",
        "transition-all duration-300",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE ROW - Enhanced hover & selection states
// ============================================
function TableRow({
  className,
  hoverable = true,
  selected = false,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      className={cn(
        "border-b border-border/30",
        "transition-all duration-200 ease-out",
        hoverable && "hover:bg-primary/5 hover:shadow-sm hover:shadow-primary/5 cursor-pointer",
        selected && "bg-primary/10 border-primary/50 shadow-sm shadow-primary/10",
        "group/row",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE HEAD - Enhanced typography & spacing
// ============================================
function TableHead({
  className,
  sortable = false,
  sorted = false,
  sortDirection = "asc",
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      data-sortable={sortable || undefined}
      data-sorted={sorted || undefined}
      data-sort-direction={sortDirection}
      className={cn(
        "h-12 px-4 text-left align-middle",
        "font-semibold text-foreground/90",
        "text-xs uppercase tracking-wider",
        "whitespace-nowrap",
        "transition-all duration-200",
        "hover:text-primary hover:bg-primary/5",
        sortable && "cursor-pointer select-none",
        sorted && "text-primary bg-primary/5",
        "[&:has([role=checkbox])]:pr-0",
        "not-last:border-r not-last:border-border/30",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE CELL - Enhanced padding & alignment
// ============================================
function TableCell({
  className,
  variant = "default",
  align = "left",
  ...props
}) {
  const variants = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary font-medium",
    success: "text-green-600 font-medium",
    warning: "text-yellow-600 font-medium",
    destructive: "text-destructive font-medium",
  }

  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  return (
    <td
      data-slot="table-cell"
      data-variant={variant}
      data-align={align}
      className={cn(
        "p-4 align-middle whitespace-nowrap",
        "transition-all duration-200",
        "group-hover/row:bg-primary/5",
        variants[variant],
        alignments[align],
        "[&:has([role=checkbox])]:pr-0",
        "not-last:border-r not-last:border-border/20",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE CAPTION - Enhanced styling
// ============================================
function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "mt-4 px-4 py-3",
        "text-sm text-muted-foreground/80",
        "text-center italic",
        "bg-muted/20 rounded-lg",
        "transition-all duration-300",
        className
      )}
      {...props} 
    />
  )
}

// ============================================
// TABLE LOADING STATE - Skeleton rows
// ============================================
function TableLoading({ rows = 5, columns = 4 }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} hoverable={false}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

// ============================================
// TABLE EMPTY STATE - Beautiful empty message
// ============================================
function TableEmpty({
  icon: Icon,
  title = "No data available",
  description = "There are no items to display at the moment.",
  action,
  className,
}) {
  return (
    <TableBody>
      <TableRow hoverable={false}>
        <TableCell colSpan={100} className="py-16">
          <div className={cn(
            "flex flex-col items-center justify-center text-center",
            "space-y-4",
            className
          )}>
            {Icon && (
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Icon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableLoading,
  TableEmpty,
}