# Theme System

This guide documents how dark/light theme switching is implemented in Waldur HomePort.

## Architecture Overview

The theme is one attribute: `data-theme="light|dark"` on `<html>`. Everything follows it:

- **Design tokens.** Every semantic token file has a `:root[data-theme='dark']` block, so
  `var(--bg-primary)` and friends switch.
- **Tailwind.** The `dark:` variant keys off the same attribute.
- **Bootstrap / Metronic.** `src/styles/bootstrap/index.scss` is **one stylesheet for both themes**:
  its colours read the tokens, and the few pairings no token has use the `dark-theme` mixin
  (`src/styles/bootstrap/_mixins.scss`), which emits `:where([data-theme='dark']) &` — the same
  specificity as the rule it overrides:

```scss
.list-group-item {
  background-color: var(--bg-primary);

  @include dark-theme {
    background-color: var(--bg-tertiary);
  }
}
```

There used to be a second, dark compile (`style.dark.scss`, `$mode: dark`, with the SCSS ramps
inverted by `isDarkMode()`), swapped in when the theme changed. It is gone; don't reintroduce a
theme-specific SCSS value. A colour inside an SVG data URI cannot be reached by a `var()`; use an inline SVG with
`currentColor` instead — the breadcrumb separator and the close icon moved off data URIs for that reason.

## Key Files

| File                                             | Purpose                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `src/theme/ThemeProvider.tsx`                    | React context provider for theme state                                           |
| `src/theme/useTheme.ts`                          | Hook to access current theme                                                     |
| `src/theme/ThemeStorage.ts`                      | localStorage persistence                                                         |
| `src/theme/utils.ts`                             | Injects the Bootstrap stylesheet once, sets `data-theme`, initial theme detection|
| `src/theme/ThemeSwitcher.tsx`                    | UI toggle component                                                              |
| `src/styles/bootstrap/_variables.scss`           | Consolidated Sass variables (design tokens as `var(--…)`, `$white`, `$black`)   |
| `src/styles/bootstrap/_mixins.scss`              | `dark-theme` / `light-theme` mixins, `mirrored-ramp-color()`                     |

## Theme Initialization Flow

1. `Application.tsx` wraps the app with `ThemeProvider`
2. `ThemeProvider` calls `getInitialTheme()` which checks:
   - localStorage for saved preference
   - OS `prefers-color-scheme` setting
   - Falls back to 'light'
3. `applyTheme()` sets `data-theme` on `<html>` (the Metronic stylesheet is a static import
   in `src/index.tsx`),
   which switches the CSS custom properties, Tailwind's `dark:` variant and the Metronic
   `dark-theme` rules
4. User toggles update localStorage and `data-theme`; nothing is reloaded

## Usage Patterns

### Pattern 1: Semantic Tailwind Utilities (Recommended)

Use the semantic utilities. Each one is exactly the design token of the same name, so it
follows the theme without a `dark:` twin:

```tsx
// Good - semantic utilities, theme-aware
<div className="bg-secondary rounded-md border-[1px] border-secondary p-4">
  <h6 className="text-primary">Title</h6>
  <p className="text-quaternary">Description</p>
</div>

// Avoid - Bootstrap Alert components don't always adapt text colors properly
<Alert variant="info">This may have contrast issues in dark mode</Alert>
```

**Theme-aware utilities** (full reference in
[design-tokens.md](design-tokens.md)):

| Utility                         | Token                               | Light → Dark                  |
| ------------------------------- | ----------------------------------- | ----------------------------- |
| `bg-primary`                    | `--bg-primary`                      | White → near-black            |
| `bg-secondary`                  | `--bg-secondary`                    | gray-50 → dark gray           |
| `bg-tertiary` / `bg-quaternary` | `--bg-tertiary` / `--bg-quaternary` | gray-100 / 200 → darker grays |
| `text-primary` … `text-senary`  | `--text-primary` … `--text-senary`  | gray-900 … 300 → light grays  |
| `border-primary`                | `--border-primary`                  | Control border                |
| `border-secondary`              | `--border-secondary`                | Card border                   |
| `text-brand`                    | `--brand-color`                     | Brand (tenant colour)         |

For the brand colour use `text-brand` (and `border-brand`, `outline-brand`). State colours (success, warning, danger) use the
status matrix: `bg-warning-subtle text-warning`.

**Bootstrap emits no colour utilities**: its old class names (`text-muted`, `text-success`,
`bg-light`, …) paint nothing, and every colour class is Tailwind's (`text-muted` →
`text-quaternary`). Never pair Bootstrap's `border` class with a Tailwind border colour: the
colour never paints (use `border-[1px]`). See
[design-tokens.md § Bootstrap colour utilities](design-tokens.md).

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

### Pattern 3: CSS Custom Properties in SCSS & CSS

When writing custom SCSS or CSS, use semantic CSS custom properties directly:

```scss
.my-component {
  background-color: var(--bg-primary); // Adapts automatically
  color: var(--text-primary); // Adapts automatically
  border: 1px solid var(--border-primary); // Adapts automatically
}
```

**Common semantic tokens** (defined in `packages/design-tokens/src/css/semantic/`; the full
list with values is in [design-tokens.md § Semantic roles](design-tokens.md)):

```scss
// Backgrounds
var(--bg-primary)        // Base surface
var(--bg-primary-hover)  // Hover/highlight on that surface
var(--bg-secondary)      // Faint panel
var(--bg-tertiary)       // Tiles, chips
var(--bg-quaternary)     // Stronger fill

// Text and icons: one neutral scale, strongest first
var(--text-primary)      // Headings, primary content
var(--text-secondary)    // Body copy
var(--text-tertiary)     // Supporting text
var(--text-quaternary)   // Muted text, placeholders
var(--text-quinary)      // Faint text, decorative icons
var(--text-senary)       // Disabled marks
var(--text-disabled)     // Disabled input text

// Borders
var(--border-primary)    // Control borders
var(--border-secondary)  // Card borders
var(--border-divider)    // A drawn line

// States: --status-{success,warning,danger}-{bg,border,solid,fg}
var(--status-danger-fg)  // Error text/icon, AA on any surface
var(--status-warning-bg) // Warning tint

// Brand (runtime, per tenant): never $primary in SCSS
var(--bg-brand-solid)
var(--border-brand-solid)
var(--fg-brand-primary)
```

### Pattern 4: CSS Custom Properties

For runtime theming needs, use CSS custom properties:

```css
/* Defined in packages/design-tokens/src/css/semantic/background.css */
:root {
  --bg-primary: #ffffff;
}

/* Usage */
.component {
  background: var(--bg-primary);
}
```

## Common Pitfalls

### Static Brand Colour in SCSS

`$primary` and `$primary-N` compile to a static default green; the tenant's brand is the runtime
`--brand-*` ramp. Paint brand in SCSS with `var(--bg-brand-solid)`, `var(--fg-brand-primary)`,
`var(--brand-600)` and so on, never `$primary`. See
[design-tokens.md § The brand colour in SCSS](design-tokens.md).

### Hardcoded Colors

Avoid hardcoding colors that won't adapt:

```tsx
// Bad - won't adapt to dark mode
<div style={{ backgroundColor: '#f5f5f5', color: '#333' }}>

// Good - semantic utilities follow the theme
<div className="bg-secondary text-secondary">
```

### Third-Party Components

Components like react-select, Monaco Editor, and ECharts need explicit theme configuration via the `useTheme()` hook. Check existing implementations for examples:

- `src/form/select/theme.ts` - react-select theming
- `src/form/MonacoField.tsx` - Monaco Editor theming
- `src/core/EChart.tsx` - ECharts theming

## Testing Dark Mode

1. Toggle theme using the switcher in the user dropdown menu
2. Check that:

- Text is readable against backgrounds
- Borders are visible but not harsh
- Interactive elements have visible hover states
- Third-party components match the overall theme
