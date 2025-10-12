/**
 * Design System Index
 * Complete unbound design system export
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types'

// ============================================================================
// TOKENS
// ============================================================================
export * from './tokens'

// ============================================================================
// THEME
// ============================================================================
export * from './theme'

// ============================================================================
// PROVIDER
// ============================================================================
export * from './provider'

// ============================================================================
// UTILITIES
// ============================================================================

import { cn } from '@/lib/utils'

export { cn }

// ============================================================================
// DESIGN SYSTEM CONFIGURATION
// ============================================================================

export const designSystemConfig = {
  version: '2.0.0',
  name: 'pow3r.cashout Design System',
  description: 'Unbound design system with complete separation of concerns',
  features: [
    'Design tokens',
    'Theme system',
    'Compound components',
    'Error boundaries',
    'Performance optimization',
    'Accessibility',
    'Responsive design',
    'TypeScript support',
  ],
  components: [
    'Button',
    'Card',
    'Input',
    'Badge',
    'Progress',
    'Tabs',
  ],
  themes: [
    'light',
    'dark',
    'pow3r',
    'pow3r-dark',
  ],
}
