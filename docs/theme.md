# Theme System

This guide documents how dark/light theme switching is implemented in Waldur HomePort.

## Architecture Overview

The app uses **two separate compiled stylesheets** that are dynamically loaded based on the selected theme:

- `src/metronic/sass/style.scss` - Light theme (`$mode: default`)
- `src/metronic/sass/style.dark.scss` - Dark theme (`$mode: dark`)

SCSS variables use the `isDarkMode()` function to return different values at compile time:

```scss
// In _colors.scss
$gray-50: if(isDarkMode(), #161b26, #f9fafb);
$gray-100: if(isDarkMode(), #1f242f, #f2f4f7);
$gray-900: if(isDarkMode(), #f5f5f6, #101828);
```

## Key Files

| File | Purpose |
|------|---------|
| `src/theme/ThemeProvider.tsx` | React context provider for theme state |
| `src/theme/useTheme.ts` | Hook to access current theme |
| `src/theme/ThemeStorage.ts` | localStorage persistence |
| `src/theme/utils.ts` | Dynamic CSS loading, initial theme detection |
| `src/theme/ThemeSwitcher.tsx` | UI toggle component |
| `src/metronic/sass/_tokens.scss` | Semantic design tokens |
| `src/metronic/sass/_colors.scss` | Theme-aware color definitions |
| `src/metronic/sass/core/base/functions/_mode.scss` | `isDarkMode()` SCSS function |

## Theme Initialization Flow

1. `Application.tsx` wraps the app with `ThemeProvider`
2. `ThemeProvider` calls `getInitialTheme()` which checks:
  - localStorage for saved preference
  - OS `prefers-color-scheme` setting
  - Falls back to 'light'
3. `loadTheme()` dynamically imports the appropriate stylesheet
4. User toggles update localStorage and reload the CSS

## Usage Patterns

### Pattern 1: Bootstrap Utility Classes (Recommended)

For simple styling, use Bootstrap utility classes that automatically adapt to the theme:

```tsx
// Good - theme-aware classes
<div className="bg-secondary p-4">
  <h6 className="text-primary">Title</h6>
  <p className="text-muted">Description</p>
</div>

// Avoid - Bootstrap Alert components don't always adapt text colors properly
<Alert variant="info">This may have contrast issues in dark mode</Alert>
```

**Common theme-aware classes:**

| Class | Light Mode | Dark Mode |
|-------|------------|-----------|
| `bg-primary` | White | Dark gray |
| `bg-secondary` | Light gray (#f9fafb) | Dark gray (#161b26) |
| `text-primary` | Dark text | Light text |
| `text-secondary` | Gray text | Lighter gray text |
| `text-muted` | Muted gray | Muted light gray |
| `border-primary` | Light border | Dark border |

### Pattern 2: useTheme() Hook

For third-party libraries that need explicit theme values:

```tsx
import { useTheme } from '@/theme/useTheme';

const MyComponent = () => {
  const { theme } = useTheme();

  // For Monaco Editor
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'vs-light';

  // For ECharts
  const chartTheme = `${theme}-metronic`;

  return <MonacoEditor theme={editorTheme} />;
};
```

### Pattern 3: SCSS Design Tokens

When writing custom SCSS, use the semantic design tokens:

```scss
.my-component {
  background-color: $bg-primary;      // Adapts automatically
  color: $text-primary;               // Adapts automatically
  border: 1px solid $border-primary;  // Adapts automatically
}
```

**Available tokens** (from `_tokens.scss`):

```scss
// Backgrounds
$bg-primary        // Main background
$bg-primary_hover  // Hover state
$bg-secondary      // Secondary/card background
$bg-tertiary       // Tertiary background

// Text
$text-primary      // Primary text
$text-secondary    // Secondary text
$text-tertiary     // Tertiary/disabled text

// Borders
$border-primary    // Primary borders
$border-secondary  // Subtle borders
```

### Pattern 4: CSS Custom Properties

For runtime theming needs, use CSS custom properties:

```scss
// Defined in _root.scss
:root {
  --waldur-bg-primary: #{$bg-primary};
  --waldur-border-secondary: #{$border-secondary};
}

// Usage
.component {
  background: var(--waldur-bg-primary);
}
```

## Common Pitfalls

### Bootstrap Alert Components

Bootstrap Alert components (`<Alert variant="info">`) may not properly adapt text colors in dark mode. Instead, use custom styled divs:

```tsx
// Instead of this:
<Alert variant="info">
  <Alert.Heading>Title</Alert.Heading>
  Content here
</Alert>

// Use this:
<div className="rounded border border-primary bg-secondary p-4">
  <h6 className="text-primary mb-2">Title</h6>
  <p className="text-muted mb-0">Content here</p>
</div>
```

### Hardcoded Colors

Avoid hardcoding colors that won't adapt:

```tsx
// Bad - won't adapt to dark mode
<div style={{ backgroundColor: '#f5f5f5', color: '#333' }}>

// Good - uses theme-aware classes
<div className="bg-secondary text-primary">
```

### Third-Party Components

Components like react-select, Monaco Editor, and ECharts need explicit theme configuration via the `useTheme()` hook. Check existing implementations for examples:

- `src/form/themed-select.tsx` - react-select theming
- `src/form/MonacoField.tsx` - Monaco Editor theming
- `src/core/EChart.tsx` - ECharts theming

## Testing Dark Mode

1. Toggle theme using the switcher in the user dropdown menu
2. Check that:
  - Text is readable against backgrounds
  - Borders are visible but not harsh
  - Interactive elements have visible hover states
  - Third-party components match the overall theme
