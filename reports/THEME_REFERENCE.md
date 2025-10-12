# Theme Reference Guide

Quick reference for the power.components theme system integrated into Repo to 3D.

## Available Themes

### 1. pow3r (Light Variant)
**Theme Name**: `"pow3r"`  
**Type**: Light theme with vibrant colors  
**Primary Color**: Blue `hsl(210, 50%, 50%)`  
**Accent Color**: Pink `hsl(320, 50%, 50%)`  
**Background**: Light gray/white  
**Best For**: Daytime use, presentations

```tsx
setTheme('pow3r');
```

### 2. pow3r-dark (Default) ⭐
**Theme Name**: `"pow3r-dark"`  
**Type**: Dark theme with vibrant colors  
**Primary Color**: Blue `hsl(210, 50%, 50%)`  
**Accent Color**: Pink `hsl(320, 50%, 50%)`  
**Background**: Very dark gray/black  
**Best For**: Night use, coding, reduced eye strain

```tsx
setTheme('pow3r-dark');
```

### 3. light
**Theme Name**: `"light"`  
**Type**: Standard light theme  
**Primary Color**: Blue  
**Background**: White  
**Best For**: Clean, minimal interface

```tsx
setTheme('light');
```

### 4. dark
**Theme Name**: `"dark"`  
**Type**: Standard dark theme  
**Primary Color**: Blue  
**Background**: Dark gray  
**Best For**: Default dark mode

```tsx
setTheme('dark');
```

---

## Quick Start

### Change Theme Programmatically

```tsx
import { useTheme } from '@/lib/design-system/provider';

function MyComponent() {
  const { setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('pow3r-dark')}>
      Switch to Pow3r Dark
    </button>
  );
}
```

### Get Current Theme Info

```tsx
import { useTheme } from '@/lib/design-system/provider';

function MyComponent() {
  const { theme, themeName, isDark, tokens } = useTheme();
  
  console.log('Current theme:', themeName);
  console.log('Is dark mode:', isDark);
  console.log('Primary color:', tokens.colors.primary[500]);
}
```

### Toggle Dark/Light

```tsx
import { useTheme } from '@/lib/design-system/provider';

function MyComponent() {
  const { toggleTheme } = useTheme();
  
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

---

## Color Palette

### Primary Colors
All themes include an 11-shade color scale (50-950):

```typescript
tokens.colors.primary = {
  50:  'hsl(210, 95%, 95%)',  // Lightest
  100: 'hsl(210, 90%, 90%)',
  200: 'hsl(210, 80%, 80%)',
  300: 'hsl(210, 70%, 70%)',
  400: 'hsl(210, 60%, 60%)',
  500: 'hsl(210, 50%, 50%)',  // Base
  600: 'hsl(210, 40%, 40%)',
  700: 'hsl(210, 30%, 30%)',
  800: 'hsl(210, 20%, 20%)',
  900: 'hsl(210, 10%, 10%)',
  950: 'hsl(210, 5%, 5%)',    // Darkest
}
```

### Color Categories
- **primary** - Main brand color
- **secondary** - Secondary brand color
- **accent** - Accent/highlight color
- **neutral** - Gray scale
- **success** - Green (confirmations, success states)
- **warning** - Yellow/Orange (warnings, cautions)
- **error** - Red (errors, destructive actions)
- **info** - Blue (information, help)

### Special Colors
- **background** - Page background
- **surface** - Card/container backgrounds
- **overlay** - Modal/overlay backgrounds (with transparency)
- **text** - Text colors
- **textMuted** - Muted/secondary text
- **textInverse** - Inverse text (light on dark, dark on light)
- **border** - Border colors
- **borderMuted** - Muted borders
- **borderFocus** - Focus ring colors
- **hover** - Hover states
- **active** - Active states
- **disabled** - Disabled states
- **focus** - Focus states

---

## CSS Variables

All theme colors are automatically available as CSS variables:

```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 210 50% 50%;
  --accent: 320 50% 50%;
  /* ... etc */
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 50% 50%;
  --accent: 320 50% 50%;
  /* ... etc */
}
```

### Using CSS Variables

```css
.my-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
}
```

### Using with Tailwind

```tsx
<div className="bg-primary text-primary-foreground border border-border">
  Themed element
</div>
```

---

## Typography

### Font Families

```typescript
tokens.typography.fontFamily = {
  sans: ['ui-sans-serif', 'system-ui', ...],
  serif: ['ui-serif', 'Georgia', ...],
  mono: ['ui-monospace', 'SFMono-Regular', ...],
  display: ['ui-sans-serif', 'system-ui', ...]
}
```

### Font Sizes

```typescript
fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem'     // 128px
}
```

### Font Weights

```typescript
fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
}
```

---

## Spacing

Consistent spacing scale from 0 to 96:

```typescript
spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  // ... up to 96
}
```

---

## Shadows

```typescript
shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
}
```

---

## Border Radius

```typescript
borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'    // Pill shape
}
```

---

## Animation

### Durations

```typescript
duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
}
```

### Easing

```typescript
easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}
```

---

## Breakpoints

```typescript
breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

### Responsive Hook

```tsx
import { useResponsiveTheme } from '@/lib/design-system/provider';

function MyComponent() {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsiveTheme();
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

---

## Z-Index Layers

```typescript
zIndex = {
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
  tooltip: 1800
}
```

---

## Theme Switcher Components

### ThemeToggle (Simple)

```tsx
import { ThemeToggle } from '@/components/ThemeSwitcher';

<ThemeToggle />
```

Shows a sun/moon icon that toggles between light and dark variants.

### ThemeSwitcher (Full)

```tsx
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// Icon buttons for each theme
<ThemeSwitcher variant="icons" />

// Dropdown selector
<ThemeSwitcher variant="dropdown" />
```

---

## Tips

### System Preference
The theme system automatically detects the user's OS dark mode preference:

```tsx
<ThemeProvider 
  defaultTheme="pow3r-dark" 
  enableSystemPreference={true}
>
  {children}
</ThemeProvider>
```

### Persistence
Theme choices are automatically saved to localStorage:

```typescript
// Storage key: 'theme'
localStorage.getItem('theme') // Returns current theme name
```

### Custom Themes
Create your own theme:

```typescript
import { createTheme, createDarkTheme } from '@/lib/design-system/theme';

const myTheme = createTheme('my-theme', {
  colors: {
    primary: {
      500: 'hsl(160, 80%, 40%)' // Your custom color
    }
  }
});
```

---

## Common Patterns

### Themed Button

```tsx
<button 
  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
>
  Click me
</button>
```

### Themed Card

```tsx
<div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Themed Input

```tsx
<input 
  className="bg-background text-foreground border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring"
  placeholder="Enter text..."
/>
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [Class Variance Authority](https://cva.style/docs)
- Power.Components Source: `/Users/creator/Documents/DEV/Jaime/power.components`

---

**Happy theming! 🎨**

