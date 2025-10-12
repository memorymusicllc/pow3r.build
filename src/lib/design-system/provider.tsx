/**
 * Design System Provider
 * Theme provider with context and CSS variable injection
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeConfig, DesignTokens } from './types'
import { themeConfig, generateCSSVariables } from './theme'

// ============================================================================
// THEME CONTEXT
// ============================================================================

interface ThemeContextValue {
  theme: Theme
  themeName: string
  setTheme: (themeName: string) => void
  toggleTheme: () => void
  isDark: boolean
  tokens: DesignTokens
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// ============================================================================
// THEME PROVIDER PROPS
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
  config?: ThemeConfig
  enableSystemPreference?: boolean
  enableCSSVariables?: boolean
  storageKey?: string
}

// ============================================================================
// THEME PROVIDER
// ============================================================================

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'pow3r',
  config = themeConfig,
  enableSystemPreference = true,
  enableCSSVariables = true,
  storageKey = 'theme',
}) => {
  const [themeName, setThemeName] = useState<string>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored && config.themes[stored]) {
        return stored
      }
    }

    // Check system preference
    if (enableSystemPreference && typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    }

    return defaultTheme
  })

  const theme = config.themes[themeName] || config.themes[config.defaultTheme]
  const isDark = themeName.includes('dark')

  // Update CSS variables when theme changes
  useEffect(() => {
    if (enableCSSVariables && typeof document !== 'undefined') {
      const cssVariables = generateCSSVariables(theme)
      
      // Create or update style element
      let styleElement = document.getElementById('theme-variables') as HTMLStyleElement
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = 'theme-variables'
        document.head.appendChild(styleElement)
      }
      
      styleElement.textContent = cssVariables
      
      // Update document class for dark mode
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, isDark, enableCSSVariables])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystemPreference || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no theme is stored
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        setThemeName(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enableSystemPreference, storageKey])

  const setTheme = (newThemeName: string) => {
    if (config.themes[newThemeName]) {
      setThemeName(newThemeName)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newThemeName)
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const contextValue: ThemeContextValue = {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    isDark,
    tokens: theme.tokens,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// THEME HOOK
// ============================================================================

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// ============================================================================
// DESIGN TOKEN HOOK
// ============================================================================

export const useDesignTokens = (): DesignTokens => {
  const { tokens } = useTheme()
  return tokens
}

// ============================================================================
// THEME TOKEN HOOK
// ============================================================================

export const useThemeToken = (path: string): string | undefined => {
  const { theme } = useTheme()
  
  const keys = path.split('.')
  let current: any = theme.tokens

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

// ============================================================================
// RESPONSIVE THEME HOOK
// ============================================================================

export const useResponsiveTheme = () => {
  const { theme, tokens } = useTheme()
  const [breakpoint, setBreakpoint] = useState<string>('md')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBreakpoint = () => {
      const width = window.innerWidth
      const breakpoints = tokens.breakpoints
      
      if (width >= parseInt(breakpoints['2xl'])) {
        setBreakpoint('2xl')
      } else if (width >= parseInt(breakpoints.xl)) {
        setBreakpoint('xl')
      } else if (width >= parseInt(breakpoints.lg)) {
        setBreakpoint('lg')
      } else if (width >= parseInt(breakpoints.md)) {
        setBreakpoint('md')
      } else if (width >= parseInt(breakpoints.sm)) {
        setBreakpoint('sm')
      } else {
        setBreakpoint('xs')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [tokens.breakpoints])

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  }
}

// ============================================================================
// THEME SWITCHER COMPONENT
// ============================================================================

interface ThemeSwitcherProps {
  className?: string
  showLabel?: boolean
  variant?: 'button' | 'select' | 'toggle'
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showLabel = true,
  variant = 'button',
}) => {
  const { themeName, setTheme, toggleTheme, isDark } = useTheme()
  const config = themeConfig

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleTheme}
        className={`inline-flex items-center space-x-2 ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? (
          <>
            <span className="w-4 h-4">☀️</span>
            {showLabel && <span>Light</span>}
          </>
        ) : (
          <>
            <span className="w-4 h-4">🌙</span>
            {showLabel && <span>Dark</span>}
          </>
        )}
      </button>
    )
  }

  if (variant === 'select') {
    return (
      <select
        value={themeName}
        onChange={(e) => setTheme(e.target.value)}
        className={className}
        aria-label="Select theme"
      >
        {Object.entries(config.themes).map(([name, theme]) => (
          <option key={name} value={name}>
            {(theme as any).name || name}
          </option>
        ))}
      </select>
    )
  }

  // Default button variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {Object.entries(config.themes).map(([name, theme]) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          className={`px-3 py-1 rounded text-sm ${
            themeName === name
              ? 'bg-primary-500 text-primary-50'
              : 'bg-surface-100 text-text-900 hover:bg-surface-200'
          }`}
          aria-label={`Switch to ${(theme as any).name || name} theme`}
        >
          {(theme as any).name || name}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// THEME PREVIEW COMPONENT
// ============================================================================

interface ThemePreviewProps {
  className?: string
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ className = '' }) => {
  const { theme, tokens } = useTheme()

  return (
    <div className={`p-4 rounded-lg border ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>
      
      <div className="space-y-4">
        {/* Colors */}
        <div>
          <h4 className="text-sm font-medium mb-2">Colors</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(tokens.colors.primary).map(([shade, color]) => (
              <div
                key={shade}
                className="h-8 rounded border"
                style={{ backgroundColor: color }}
                title={`Primary ${shade}: ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h4 className="text-sm font-medium mb-2">Typography</h4>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-base">Body text</p>
            <p className="text-sm text-text-muted-500">Muted text</p>
          </div>
        </div>

        {/* Components */}
        <div>
          <h4 className="text-sm font-medium mb-2">Components</h4>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-primary-500 text-primary-50 rounded hover:bg-primary-600">
              Button
            </button>
            <div className="px-3 py-1 bg-surface-100 text-text-900 rounded border">
              Badge
            </div>
            <input
              type="text"
              placeholder="Input"
              className="px-3 py-2 border border-border-300 rounded focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
