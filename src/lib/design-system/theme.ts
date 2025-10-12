/**
 * Theme System
 * Complete theme management with design token integration
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import { Theme, ThemeConfig, DesignTokens } from './types'
import { designTokens } from './tokens'

// ============================================================================
// THEME CREATION UTILITIES
// ============================================================================

export const createTheme = (
  name: string,
  overrides: Partial<DesignTokens> = {}
): Theme => ({
  name,
  tokens: {
    ...designTokens,
    ...overrides,
  },
  components: {},
  customProperties: {},
})

export const createDarkTheme = (
  name: string,
  overrides: Partial<DesignTokens> = {}
): Theme => {
  const darkOverrides: Partial<DesignTokens> = {
    colors: {
      ...designTokens.colors,
      background: {
        50: 'hsl(0, 0%, 0%)',
        100: 'hsl(0, 0%, 5%)',
        200: 'hsl(0, 0%, 10%)',
        300: 'hsl(0, 0%, 15%)',
        400: 'hsl(0, 0%, 20%)',
        500: 'hsl(0, 0%, 25%)',
        600: 'hsl(0, 0%, 30%)',
        700: 'hsl(0, 0%, 35%)',
        800: 'hsl(0, 0%, 40%)',
        900: 'hsl(0, 0%, 45%)',
        950: 'hsl(0, 0%, 50%)',
      },
      surface: {
        50: 'hsl(0, 0%, 5%)',
        100: 'hsl(0, 0%, 10%)',
        200: 'hsl(0, 0%, 15%)',
        300: 'hsl(0, 0%, 20%)',
        400: 'hsl(0, 0%, 25%)',
        500: 'hsl(0, 0%, 30%)',
        600: 'hsl(0, 0%, 35%)',
        700: 'hsl(0, 0%, 40%)',
        800: 'hsl(0, 0%, 45%)',
        900: 'hsl(0, 0%, 50%)',
        950: 'hsl(0, 0%, 55%)',
      },
      text: {
        50: 'hsl(0, 0%, 0%)',
        100: 'hsl(0, 0%, 10%)',
        200: 'hsl(0, 0%, 20%)',
        300: 'hsl(0, 0%, 30%)',
        400: 'hsl(0, 0%, 40%)',
        500: 'hsl(0, 0%, 50%)',
        600: 'hsl(0, 0%, 60%)',
        700: 'hsl(0, 0%, 70%)',
        800: 'hsl(0, 0%, 80%)',
        900: 'hsl(0, 0%, 90%)',
        950: 'hsl(0, 0%, 95%)',
      },
      textMuted: {
        50: 'hsl(0, 0%, 5%)',
        100: 'hsl(0, 0%, 15%)',
        200: 'hsl(0, 0%, 25%)',
        300: 'hsl(0, 0%, 35%)',
        400: 'hsl(0, 0%, 45%)',
        500: 'hsl(0, 0%, 55%)',
        600: 'hsl(0, 0%, 65%)',
        700: 'hsl(0, 0%, 75%)',
        800: 'hsl(0, 0%, 85%)',
        900: 'hsl(0, 0%, 95%)',
        950: 'hsl(0, 0%, 100%)',
      },
      border: {
        50: 'hsl(0, 0%, 5%)',
        100: 'hsl(0, 0%, 15%)',
        200: 'hsl(0, 0%, 25%)',
        300: 'hsl(0, 0%, 35%)',
        400: 'hsl(0, 0%, 45%)',
        500: 'hsl(0, 0%, 55%)',
        600: 'hsl(0, 0%, 65%)',
        700: 'hsl(0, 0%, 75%)',
        800: 'hsl(0, 0%, 85%)',
        900: 'hsl(0, 0%, 95%)',
        950: 'hsl(0, 0%, 100%)',
      },
      ...overrides.colors,
    },
    ...overrides,
  }

  return createTheme(name, darkOverrides)
}

// ============================================================================
// PREDEFINED THEMES
// ============================================================================

export const lightTheme = createTheme('light')

export const darkTheme = createDarkTheme('dark')

export const pow3rTheme = createTheme('pow3r', {
  colors: {
    ...designTokens.colors,
    primary: {
      50: 'hsl(210, 95%, 95%)',
      100: 'hsl(210, 90%, 90%)',
      200: 'hsl(210, 80%, 80%)',
      300: 'hsl(210, 70%, 70%)',
      400: 'hsl(210, 60%, 60%)',
      500: 'hsl(210, 50%, 50%)',
      600: 'hsl(210, 40%, 40%)',
      700: 'hsl(210, 30%, 30%)',
      800: 'hsl(210, 20%, 20%)',
      900: 'hsl(210, 10%, 10%)',
      950: 'hsl(210, 5%, 5%)',
    },
    accent: {
      50: 'hsl(320, 95%, 95%)',
      100: 'hsl(320, 90%, 90%)',
      200: 'hsl(320, 80%, 80%)',
      300: 'hsl(320, 70%, 70%)',
      400: 'hsl(320, 60%, 60%)',
      500: 'hsl(320, 50%, 50%)',
      600: 'hsl(320, 40%, 40%)',
      700: 'hsl(320, 30%, 30%)',
      800: 'hsl(320, 20%, 20%)',
      900: 'hsl(320, 10%, 10%)',
      950: 'hsl(320, 5%, 5%)',
    },
  },
})

export const pow3rDarkTheme = createDarkTheme('pow3r-dark', {
  colors: {
    ...designTokens.colors,
    primary: {
      50: 'hsl(210, 95%, 95%)',
      100: 'hsl(210, 90%, 90%)',
      200: 'hsl(210, 80%, 80%)',
      300: 'hsl(210, 70%, 70%)',
      400: 'hsl(210, 60%, 60%)',
      500: 'hsl(210, 50%, 50%)',
      600: 'hsl(210, 40%, 40%)',
      700: 'hsl(210, 30%, 30%)',
      800: 'hsl(210, 20%, 20%)',
      900: 'hsl(210, 10%, 10%)',
      950: 'hsl(210, 5%, 5%)',
    },
    accent: {
      50: 'hsl(320, 95%, 95%)',
      100: 'hsl(320, 90%, 90%)',
      200: 'hsl(320, 80%, 80%)',
      300: 'hsl(320, 70%, 70%)',
      400: 'hsl(320, 60%, 60%)',
      500: 'hsl(320, 50%, 50%)',
      600: 'hsl(320, 40%, 40%)',
      700: 'hsl(320, 30%, 30%)',
      800: 'hsl(320, 20%, 20%)',
      900: 'hsl(320, 10%, 10%)',
      950: 'hsl(320, 5%, 5%)',
    },
  },
})

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const themeConfig: ThemeConfig = {
  defaultTheme: 'pow3r',
  themes: {
    light: lightTheme,
    dark: darkTheme,
    pow3r: pow3rTheme,
    'pow3r-dark': pow3rDarkTheme,
  },
  darkMode: true,
  systemPreference: true,
}

// ============================================================================
// CSS CUSTOM PROPERTIES GENERATION
// ============================================================================

export const generateCSSVariables = (theme: Theme): string => {
  const { tokens } = theme
  const variables: string[] = []

  // Color variables
  Object.entries(tokens.colors).forEach(([colorName, colorScale]) => {
    Object.entries(colorScale).forEach(([shade, value]) => {
      variables.push(`--color-${colorName}-${shade}: ${value};`)
    })
  })

  // Typography variables
  Object.entries(tokens.typography.fontSize).forEach(([size, value]) => {
    variables.push(`--font-size-${size}: ${value};`)
  })

  Object.entries(tokens.typography.fontWeight).forEach(([weight, value]) => {
    variables.push(`--font-weight-${weight}: ${value};`)
  })

  Object.entries(tokens.typography.lineHeight).forEach(([height, value]) => {
    variables.push(`--line-height-${height}: ${value};`)
  })

  // Spacing variables
  Object.entries(tokens.spacing).forEach(([space, value]) => {
    variables.push(`--spacing-${space}: ${value};`)
  })

  // Shadow variables
  Object.entries(tokens.shadows).forEach(([shadow, value]) => {
    variables.push(`--shadow-${shadow}: ${value};`)
  })

  // Border variables
  Object.entries(tokens.borders.radius).forEach(([radius, value]) => {
    variables.push(`--border-radius-${radius}: ${value};`)
  })

  Object.entries(tokens.borders.width).forEach(([width, value]) => {
    variables.push(`--border-width-${width}: ${value};`)
  })

  // Animation variables
  Object.entries(tokens.animations.duration).forEach(([duration, value]) => {
    variables.push(`--duration-${duration}: ${value};`)
  })

  Object.entries(tokens.animations.easing).forEach(([easing, value]) => {
    variables.push(`--easing-${easing}: ${value};`)
  })

  // Z-index variables
  Object.entries(tokens.zIndex).forEach(([zIndex, value]) => {
    variables.push(`--z-index-${zIndex}: ${value};`)
  })

  return `:root {\n  ${variables.join('\n  ')}\n}`
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

export const getThemeToken = (
  theme: Theme,
  path: string
): string | undefined => {
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

export const mergeThemes = (baseTheme: Theme, overrideTheme: Partial<Theme>): Theme => ({
  ...baseTheme,
  ...overrideTheme,
  tokens: {
    ...baseTheme.tokens,
    ...overrideTheme.tokens,
  },
  components: {
    ...baseTheme.components,
    ...overrideTheme.components,
  },
  customProperties: {
    ...baseTheme.customProperties,
    ...overrideTheme.customProperties,
  },
})

export const createResponsiveTheme = (
  baseTheme: Theme,
  breakpoints: Record<string, Partial<Theme>>
): Theme => {
  // This would be used for responsive theming
  // Implementation would depend on specific requirements
  return baseTheme
}
