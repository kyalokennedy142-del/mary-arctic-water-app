// src/lib/responsive.js

// Breakpoints (matching Tailwind CSS)
export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536 // 2XLarge devices (very large desktops)
}

// Get current device type based on window width
export const getDeviceType = (width) => {
  if (width < breakpoints.sm) return 'mobile'
  if (width < breakpoints.md) return 'mobile-lg'
  if (width < breakpoints.lg) return 'tablet'
  if (width < breakpoints.xl) return 'desktop'
  return 'desktop-lg'
}

// Check if current device matches breakpoint
export const isDevice = (device) => {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  
  switch (device) {
    case 'mobile':
      return width < breakpoints.sm
    case 'tablet':
      return width >= breakpoints.sm && width < breakpoints.lg
    case 'desktop':
      return width >= breakpoints.lg
    default:
      return false
  }
}

// Responsive grid columns helper
export const getGridCols = (device) => {
  const grids = {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3',
    'desktop-lg': 'grid-cols-4'
  }
  return grids[device] || grids.desktop
}

// Responsive spacing helper
export const getSpacing = (device) => {
  const spacing = {
    mobile: { px: 4, py: 6, gap: 3 },
    tablet: { px: 6, py: 8, gap: 4 },
    desktop: { px: 8, py: 10, gap: 6 },
    'desktop-lg': { px: 10, py: 12, gap: 8 }
  }
  return spacing[device] || spacing.desktop
}