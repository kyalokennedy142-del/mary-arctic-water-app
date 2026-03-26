// src/hooks/useResponsive.js

import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { breakpoints, getDeviceType } from '@/lib/responsive'

export function useResponsive() {
  const [deviceInfo, setDeviceInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    device: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const device = getDeviceType(width)
      
      setDeviceInfo({
        width,
        height,
        device,
        isMobile: device === 'mobile' || device === 'mobile-lg',
        isTablet: device === 'tablet',
        isDesktop: device === 'desktop' || device === 'desktop-lg'
      })
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceInfo
}

// Hook to check if screen matches breakpoint
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Convenience hooks
export const useIsMobile = () => {
  const { isMobile } = useResponsive()
  return isMobile
}

export const useIsTablet = () => {
  const { isTablet } = useResponsive()
  return isTablet
}

export const useIsDesktop = () => {
  const { isDesktop } = useResponsive()
  return isDesktop
}