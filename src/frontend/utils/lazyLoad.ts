import { lazy, Suspense } from 'react'

/**
 * Lazy Loading Utilities
 * Implements code splitting and lazy loading for mini-game components
 * Reduces initial bundle size and improves performance
 */

// Lazy load mini-game components
export const LazyGhostChase = lazy(() =>
  import('../components/games/GhostChase').then(module => ({
    default: module.GhostChase,
  }))
)

export const LazyPumpkinCipher = lazy(() =>
  import('../components/games/PumpkinCipher').then(module => ({
    default: module.PumpkinCipher,
  }))
)

export const LazyWitchsBrew = lazy(() =>
  import('../components/games/WitchsBrew').then(module => ({
    default: module.WitchsBrew,
  }))
)

// Lazy load UI components
export const LazyShareCostume = lazy(() =>
  import('../components/glitch/ShareCostume').then(module => ({
    default: module.ShareCostume,
  }))
)

export const LazyAccessibilityPanel = lazy(() =>
  import('../components/glitch/AccessibilityPanel').then(module => ({
    default: module.AccessibilityPanel,
  }))
)

/**
 * Image optimization utility
 * Converts images to WebP format and generates responsive sizes
 */
export const optimize_image_url = (url: string, width?: number): string => {
  // In production, this would use a service like Cloudinary or ImageKit
  // For now, return the original URL
  if (!width) return url

  // Example: append query params for image optimization
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}w=${width}&q=80&fm=webp`
}

/**
 * Cache management utility
 * Implements cache busting and storage optimization
 */
export const cache_manager = {
  set: (key: string, value: any, ttl_ms: number = 3600000) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl_ms,
    }
    localStorage.setItem(`hauntHub_cache_${key}`, JSON.stringify(item))
  },

  get: (key: string): any | null => {
    const item_str = localStorage.getItem(`hauntHub_cache_${key}`)
    if (!item_str) return null

    const item = JSON.parse(item_str)
    const is_expired = Date.now() - item.timestamp > item.ttl

    if (is_expired) {
      localStorage.removeItem(`hauntHub_cache_${key}`)
      return null
    }

    return item.value
  },

  clear: (key: string) => {
    localStorage.removeItem(`hauntHub_cache_${key}`)
  },

  clearAll: () => {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('hauntHub_cache_')) {
        localStorage.removeItem(key)
      }
    })
  },
}

/**
 * Performance monitoring utility
 * Tracks performance metrics for optimization
 */
export const performance_monitor = {
  mark: (name: string) => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name)
    }
  },

  measure: (name: string, startMark: string, endMark: string) => {
    if (window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark)
        const measure = window.performance.getEntriesByName(name)[0]
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
        return measure.duration
      } catch (error) {
        console.error(`Failed to measure ${name}:`, error)
      }
    }
  },

  getMetrics: () => {
    if (!window.performance) return null

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return null

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
      domComplete: navigation.domComplete - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    }
  },
}

export default {
  optimize_image_url,
  cache_manager,
  performance_monitor,
}
