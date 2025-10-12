/**
 * Design System Tokens
 * Complete design token system for unbound theming
 * 
 * @version 2.0.0
 * @date 2025-01-08
 */

import { DesignTokens, ColorTokens, TypographyTokens, SpacingTokens, SizingTokens, ShadowTokens, BorderTokens, AnimationTokens, BreakpointTokens, ZIndexTokens } from './types'

// ============================================================================
// COLOR TOKENS
// ============================================================================

const createColorScale = (base: string): ColorTokens['primary'] => ({
  50: `hsl(${base}, 95%, 95%)`,
  100: `hsl(${base}, 90%, 90%)`,
  200: `hsl(${base}, 80%, 80%)`,
  300: `hsl(${base}, 70%, 70%)`,
  400: `hsl(${base}, 60%, 60%)`,
  500: `hsl(${base}, 50%, 50%)`,
  600: `hsl(${base}, 40%, 40%)`,
  700: `hsl(${base}, 30%, 30%)`,
  800: `hsl(${base}, 20%, 20%)`,
  900: `hsl(${base}, 10%, 10%)`,
  950: `hsl(${base}, 5%, 5%)`,
})

export const colorTokens: ColorTokens = {
  primary: createColorScale('210'),
  secondary: createColorScale('280'),
  accent: createColorScale('320'),
  neutral: createColorScale('0'),
  success: createColorScale('120'),
  warning: createColorScale('45'),
  error: createColorScale('0'),
  info: createColorScale('200'),
  
  background: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 98%)',
    200: 'hsl(0, 0%, 96%)',
    300: 'hsl(0, 0%, 94%)',
    400: 'hsl(0, 0%, 92%)',
    500: 'hsl(0, 0%, 90%)',
    600: 'hsl(0, 0%, 88%)',
    700: 'hsl(0, 0%, 86%)',
    800: 'hsl(0, 0%, 84%)',
    900: 'hsl(0, 0%, 82%)',
    950: 'hsl(0, 0%, 80%)',
  },
  
  surface: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 99%)',
    200: 'hsl(0, 0%, 98%)',
    300: 'hsl(0, 0%, 97%)',
    400: 'hsl(0, 0%, 96%)',
    500: 'hsl(0, 0%, 95%)',
    600: 'hsl(0, 0%, 94%)',
    700: 'hsl(0, 0%, 93%)',
    800: 'hsl(0, 0%, 92%)',
    900: 'hsl(0, 0%, 91%)',
    950: 'hsl(0, 0%, 90%)',
  },
  
  overlay: {
    50: 'hsla(0, 0%, 0%, 0.05)',
    100: 'hsla(0, 0%, 0%, 0.1)',
    200: 'hsla(0, 0%, 0%, 0.2)',
    300: 'hsla(0, 0%, 0%, 0.3)',
    400: 'hsla(0, 0%, 0%, 0.4)',
    500: 'hsla(0, 0%, 0%, 0.5)',
    600: 'hsla(0, 0%, 0%, 0.6)',
    700: 'hsla(0, 0%, 0%, 0.7)',
    800: 'hsla(0, 0%, 0%, 0.8)',
    900: 'hsla(0, 0%, 0%, 0.9)',
    950: 'hsla(0, 0%, 0%, 0.95)',
  },
  
  text: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 95%)',
    200: 'hsl(0, 0%, 90%)',
    300: 'hsl(0, 0%, 85%)',
    400: 'hsl(0, 0%, 80%)',
    500: 'hsl(0, 0%, 70%)',
    600: 'hsl(0, 0%, 60%)',
    700: 'hsl(0, 0%, 50%)',
    800: 'hsl(0, 0%, 40%)',
    900: 'hsl(0, 0%, 30%)',
    950: 'hsl(0, 0%, 20%)',
  },
  
  textMuted: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 90%)',
    200: 'hsl(0, 0%, 80%)',
    300: 'hsl(0, 0%, 70%)',
    400: 'hsl(0, 0%, 60%)',
    500: 'hsl(0, 0%, 50%)',
    600: 'hsl(0, 0%, 45%)',
    700: 'hsl(0, 0%, 40%)',
    800: 'hsl(0, 0%, 35%)',
    900: 'hsl(0, 0%, 30%)',
    950: 'hsl(0, 0%, 25%)',
  },
  
  textInverse: {
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
  
  border: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 95%)',
    200: 'hsl(0, 0%, 90%)',
    300: 'hsl(0, 0%, 85%)',
    400: 'hsl(0, 0%, 80%)',
    500: 'hsl(0, 0%, 70%)',
    600: 'hsl(0, 0%, 60%)',
    700: 'hsl(0, 0%, 50%)',
    800: 'hsl(0, 0%, 40%)',
    900: 'hsl(0, 0%, 30%)',
    950: 'hsl(0, 0%, 20%)',
  },
  
  borderMuted: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 90%)',
    200: 'hsl(0, 0%, 80%)',
    300: 'hsl(0, 0%, 70%)',
    400: 'hsl(0, 0%, 60%)',
    500: 'hsl(0, 0%, 50%)',
    600: 'hsl(0, 0%, 45%)',
    700: 'hsl(0, 0%, 40%)',
    800: 'hsl(0, 0%, 35%)',
    900: 'hsl(0, 0%, 30%)',
    950: 'hsl(0, 0%, 25%)',
  },
  
  borderFocus: {
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
  
  hover: {
    50: 'hsla(210, 50%, 50%, 0.05)',
    100: 'hsla(210, 50%, 50%, 0.1)',
    200: 'hsla(210, 50%, 50%, 0.2)',
    300: 'hsla(210, 50%, 50%, 0.3)',
    400: 'hsla(210, 50%, 50%, 0.4)',
    500: 'hsla(210, 50%, 50%, 0.5)',
    600: 'hsla(210, 50%, 50%, 0.6)',
    700: 'hsla(210, 50%, 50%, 0.7)',
    800: 'hsla(210, 50%, 50%, 0.8)',
    900: 'hsla(210, 50%, 50%, 0.9)',
    950: 'hsla(210, 50%, 50%, 0.95)',
  },
  
  active: {
    50: 'hsla(210, 60%, 60%, 0.1)',
    100: 'hsla(210, 60%, 60%, 0.2)',
    200: 'hsla(210, 60%, 60%, 0.3)',
    300: 'hsla(210, 60%, 60%, 0.4)',
    400: 'hsla(210, 60%, 60%, 0.5)',
    500: 'hsla(210, 60%, 60%, 0.6)',
    600: 'hsla(210, 60%, 60%, 0.7)',
    700: 'hsla(210, 60%, 60%, 0.8)',
    800: 'hsla(210, 60%, 60%, 0.9)',
    900: 'hsla(210, 60%, 60%, 0.95)',
    950: 'hsla(210, 60%, 60%, 1)',
  },
  
  disabled: {
    50: 'hsl(0, 0%, 100%)',
    100: 'hsl(0, 0%, 95%)',
    200: 'hsl(0, 0%, 90%)',
    300: 'hsl(0, 0%, 85%)',
    400: 'hsl(0, 0%, 80%)',
    500: 'hsl(0, 0%, 70%)',
    600: 'hsl(0, 0%, 60%)',
    700: 'hsl(0, 0%, 50%)',
    800: 'hsl(0, 0%, 40%)',
    900: 'hsl(0, 0%, 30%)',
    950: 'hsl(0, 0%, 20%)',
  },
  
  focus: {
    50: 'hsla(210, 70%, 70%, 0.1)',
    100: 'hsla(210, 70%, 70%, 0.2)',
    200: 'hsla(210, 70%, 70%, 0.3)',
    300: 'hsla(210, 70%, 70%, 0.4)',
    400: 'hsla(210, 70%, 70%, 0.5)',
    500: 'hsla(210, 70%, 70%, 0.6)',
    600: 'hsla(210, 70%, 70%, 0.7)',
    700: 'hsla(210, 70%, 70%, 0.8)',
    800: 'hsla(210, 70%, 70%, 0.9)',
    900: 'hsla(210, 70%, 70%, 0.95)',
    950: 'hsla(210, 70%, 70%, 1)',
  },
}

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens: TypographyTokens = {
  fontFamily: {
    sans: [
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ],
    serif: [
      'ui-serif',
      'Georgia',
      'Cambria',
      '"Times New Roman"',
      'Times',
      'serif',
    ],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'monospace',
    ],
    display: [
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
}

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens: SpacingTokens = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
}

// ============================================================================
// SIZING TOKENS
// ============================================================================

export const sizingTokens: SizingTokens = {
  button: {
    xs: {
      height: '1.5rem',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      borderRadius: '0.25rem',
    },
    sm: {
      height: '2rem',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
    },
    md: {
      height: '2.5rem',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
    },
    lg: {
      height: '3rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
      borderRadius: '0.5rem',
    },
    xl: {
      height: '3.5rem',
      padding: '1rem 2rem',
      fontSize: '1.25rem',
      borderRadius: '0.75rem',
    },
  },
  input: {
    xs: {
      height: '1.5rem',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      borderRadius: '0.25rem',
    },
    sm: {
      height: '2rem',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
    },
    md: {
      height: '2.5rem',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
    },
    lg: {
      height: '3rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
      borderRadius: '0.5rem',
    },
    xl: {
      height: '3.5rem',
      padding: '1rem 2rem',
      fontSize: '1.25rem',
      borderRadius: '0.75rem',
    },
  },
  card: {
    sm: {
      height: 'auto',
      minHeight: '8rem',
      padding: '1rem',
      borderRadius: '0.5rem',
    },
    md: {
      height: 'auto',
      minHeight: '12rem',
      padding: '1.5rem',
      borderRadius: '0.75rem',
    },
    lg: {
      height: 'auto',
      minHeight: '16rem',
      padding: '2rem',
      borderRadius: '1rem',
    },
    xl: {
      height: 'auto',
      minHeight: '20rem',
      padding: '2.5rem',
      borderRadius: '1.25rem',
    },
  },
  modal: {
    sm: {
      height: 'auto',
      minHeight: '20rem',
      maxHeight: '80vh',
      width: '20rem',
      maxWidth: '90vw',
      padding: '1.5rem',
      borderRadius: '0.75rem',
    },
    md: {
      height: 'auto',
      minHeight: '24rem',
      maxHeight: '80vh',
      width: '28rem',
      maxWidth: '90vw',
      padding: '2rem',
      borderRadius: '1rem',
    },
    lg: {
      height: 'auto',
      minHeight: '32rem',
      maxHeight: '80vh',
      width: '40rem',
      maxWidth: '90vw',
      padding: '2.5rem',
      borderRadius: '1.25rem',
    },
    xl: {
      height: 'auto',
      minHeight: '40rem',
      maxHeight: '80vh',
      width: '56rem',
      maxWidth: '90vw',
      padding: '3rem',
      borderRadius: '1.5rem',
    },
    full: {
      height: '100vh',
      width: '100vw',
      padding: '2rem',
      borderRadius: '0',
    },
  },
}

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadowTokens: ShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}

// ============================================================================
// BORDER TOKENS
// ============================================================================

export const borderTokens: BorderTokens = {
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  radius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none',
  },
}

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animationTokens: AnimationTokens = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  keyframes: {
    fadeIn: 'fadeIn',
    fadeOut: 'fadeOut',
    slideIn: 'slideIn',
    slideOut: 'slideOut',
    scaleIn: 'scaleIn',
    scaleOut: 'scaleOut',
    rotate: 'rotate',
    bounce: 'bounce',
  },
}

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpointTokens: BreakpointTokens = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndexTokens: ZIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
}

// ============================================================================
// COMPLETE DESIGN TOKENS
// ============================================================================

export const designTokens: DesignTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  sizing: sizingTokens,
  shadows: shadowTokens,
  borders: borderTokens,
  animations: animationTokens,
  breakpoints: breakpointTokens,
  zIndex: zIndexTokens,
}
