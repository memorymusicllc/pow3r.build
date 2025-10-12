/**
 * Design System Types
 * Unbound design system with complete separation of concerns
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

// ============================================================================
// CORE DESIGN TOKENS
// ============================================================================

export interface DesignTokens {
  colors: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  sizing: SizingTokens
  shadows: ShadowTokens
  borders: BorderTokens
  animations: AnimationTokens
  breakpoints: BreakpointTokens
  zIndex: ZIndexTokens
}

export interface ColorTokens {
  // Semantic colors - completely themeable
  primary: ColorScale
  secondary: ColorScale
  accent: ColorScale
  neutral: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
  
  // Surface colors
  background: ColorScale
  surface: ColorScale
  overlay: ColorScale
  
  // Text colors
  text: ColorScale
  textMuted: ColorScale
  textInverse: ColorScale
  
  // Border colors
  border: ColorScale
  borderMuted: ColorScale
  borderFocus: ColorScale
  
  // Interactive states
  hover: ColorScale
  active: ColorScale
  disabled: ColorScale
  focus: ColorScale
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface TypographyTokens {
  fontFamily: {
    sans: string[]
    serif: string[]
    mono: string[]
    display: string[]
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
    '7xl': string
    '8xl': string
    '9xl': string
  }
  fontWeight: {
    thin: number
    extralight: number
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
    black: number
  }
  lineHeight: {
    none: number
    tight: number
    snug: number
    normal: number
    relaxed: number
    loose: number
  }
  letterSpacing: {
    tighter: string
    tight: string
    normal: string
    wide: string
    wider: string
    widest: string
  }
}

export interface SpacingTokens {
  0: string
  px: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

export interface SizingTokens {
  // Component sizes
  button: {
    xs: ComponentSize
    sm: ComponentSize
    md: ComponentSize
    lg: ComponentSize
    xl: ComponentSize
  }
  input: {
    xs: ComponentSize
    sm: ComponentSize
    md: ComponentSize
    lg: ComponentSize
    xl: ComponentSize
  }
  card: {
    sm: ComponentSize
    md: ComponentSize
    lg: ComponentSize
    xl: ComponentSize
  }
  modal: {
    sm: ComponentSize
    md: ComponentSize
    lg: ComponentSize
    xl: ComponentSize
    full: ComponentSize
  }
}

export interface ComponentSize {
  height: string
  minHeight?: string
  maxHeight?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  padding: string
  fontSize?: string
  borderRadius: string
}

export interface ShadowTokens {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface BorderTokens {
  width: {
    0: string
    1: string
    2: string
    4: string
    8: string
  }
  radius: {
    none: string
    sm: string
    base: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
  }
  style: {
    solid: string
    dashed: string
    dotted: string
    double: string
    none: string
  }
}

export interface AnimationTokens {
  duration: {
    fast: string
    normal: string
    slow: string
  }
  easing: {
    linear: string
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
    spring: string
  }
  keyframes: {
    fadeIn: string
    fadeOut: string
    slideIn: string
    slideOut: string
    scaleIn: string
    scaleOut: string
    rotate: string
    bounce: string
  }
}

export interface BreakpointTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface ZIndexTokens {
  hide: number
  auto: string
  base: number
  docked: number
  dropdown: number
  sticky: number
  banner: number
  overlay: number
  modal: number
  popover: number
  skipLink: number
  toast: number
  tooltip: number
}

// ============================================================================
// COMPONENT SYSTEM TYPES
// ============================================================================

export interface ComponentVariant {
  name: string
  styles: ComponentStyles
  props?: Record<string, any>
}

export interface ComponentStyles {
  base: string
  variants?: Record<string, string>
  states?: Record<string, string>
  responsive?: Record<string, Record<string, string>>
}

export interface ComponentConfig {
  name: string
  variants: ComponentVariant[]
  defaultVariant: string
  compoundVariants?: CompoundVariant[]
  slots?: ComponentSlots
}

export interface CompoundVariant {
  condition: Record<string, any>
  styles: string
}

export interface ComponentSlots {
  [slotName: string]: {
    base: string
    variants?: Record<string, string>
  }
}

// ============================================================================
// THEME SYSTEM TYPES
// ============================================================================

export interface Theme {
  name: string
  tokens: DesignTokens
  components: Record<string, ComponentConfig>
  customProperties?: Record<string, string>
}

export interface ThemeConfig {
  defaultTheme: string
  themes: Record<string, Theme>
  darkMode?: boolean
  systemPreference?: boolean
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  'data-testid'?: string
  'data-component'?: string
}

export interface VariantProps {
  variant?: string
  size?: string
  color?: string
  state?: 'default' | 'hover' | 'active' | 'focus' | 'disabled'
}

export interface ResponsiveProps {
  responsive?: Record<string, any>
}

export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean
  'aria-disabled'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}

export interface AnimationProps {
  animate?: boolean
  animation?: string
  duration?: string
  delay?: string
  easing?: string
}

// ============================================================================
// COMPOSITION TYPES
// ============================================================================

export interface CompoundComponentProps extends BaseComponentProps {
  children: React.ReactNode
}

export interface SlotProps extends BaseComponentProps {
  slot?: string
}

export interface ContextProps {
  value: any
  children: React.ReactNode
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ComponentProps<T = {}> = BaseComponentProps & 
  VariantProps & 
  ResponsiveProps & 
  AccessibilityProps & 
  AnimationProps & 
  T

export type PolymorphicProps<C extends React.ElementType> = {
  as?: C
} & Omit<React.ComponentPropsWithoutRef<C>, keyof BaseComponentProps> &
  BaseComponentProps

export type ForwardRefComponent<T, P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>

// ============================================================================
// ERROR BOUNDARY TYPES
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface LazyComponentProps extends BaseComponentProps {
  fallback?: React.ReactNode
  delay?: number
}

export interface VirtualizedProps extends BaseComponentProps {
  itemCount: number
  itemSize: number | ((index: number) => number)
  overscan?: number
  direction?: 'vertical' | 'horizontal'
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationProps {
  validation?: ValidationRule
  error?: string
  onValidate?: (isValid: boolean, error?: string) => void
}
