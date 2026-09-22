# Tailwind & shadcn UI Architecture

Architectural reference and design system manual for Tailwind CSS v4, shadcn UI, and Radix UI in Waldur Homeport. Documents runtime framework coexistence, design tokens, component architecture, styling conventions, and linting guardrails.

---

## Table of Contents

1. [UI Architecture & Framework Coexistence](#ui-architecture-framework-coexistence)
   - [Component Systems Overview](#component-systems-overview)
   - [Component Standards & Usage Guide](#component-standards-usage-guide)
   - [Cascade Layers](#cascade-layers)
   - [The `!important` & Class-Name Collision Rules](#the-important-class-name-collision-rules)
   - [Root Font-Size & Fractional Rem Scaling](#root-font-size-fractional-rem-scaling)
   - [The Preflight Reset Shim](#the-preflight-reset-shim)
   - [Grid Breakpoint Synchronization](#grid-breakpoint-synchronization)
   - [Design Tokens & Color Systems](#design-tokens-color-systems)
   - [Brand Color Token Bridge](#brand-color-token-bridge)
   - [Dark Mode Mechanics](#dark-mode-mechanics)
2. [Component Architecture & Guidelines](#component-architecture-guidelines)
   - [AlertItem](#alertitem)
   - [Badge](#badge)
   - [Tooltip](#tooltip)
   - [Popover](#popover)
   - [BaseButton](#basebutton)
   - [Sidebar & Mobile Sheet](#sidebar-mobile-sheet)
   - [Content Drawer (`#kt_drawer`)](#content-drawer-kt-drawer)
   - [Dropdown & Menu System Map](#dropdown-menu-system-map)
   - [ActionsDropdown & ActionItem](#actionsdropdown-actionitem)
   - [NavMenu](#navmenu)
3. [Linting & Guardrails](#linting-guardrails)
   - [Restricted Imports](#restricted-imports)
   - [Custom ESLint Rules Matrix](#custom-eslint-rules-matrix)
4. [Storybook & Testing Toolchain](#storybook-testing-toolchain)
   - [Storybook Environment & Vitest](#storybook-environment-vitest)
   - [Visual Parity Test Suite](#visual-parity-test-suite)
   - [Testing Gotchas & Pitfalls](#testing-gotchas-pitfalls)

---

## UI Architecture & Framework Coexistence

### Component Systems Overview

Waldur Homeport operates on two active UI component patterns:

1. **Modern Tailwind / Radix Primitives (`packages/ui`, exported as `waldur-ui`)**
   - Built with pure Tailwind v4 utilities and CSS design tokens from `packages/design-tokens`.
   - Free of all Bootstrap and Metronic classes, SCSS variables, and runtime mixins.
   - Includes `AlertItem`, `Badge`, `Tooltip`, `Popover`, `Sidebar`, `Sheet`, `FeaturedIcon`, `StatusPill`, `CopyButton`, `Card`, and `LoadingSpinner`.

2. **Transitional Shells (Radix Engine with Themed Skins)**
   - Used where extensive surface area requires maintaining existing container styling while leveraging accessible Radix primitives:
     - `ActionsDropdown.tsx` / `ActionItem.tsx`: Radix `DropdownMenu` and `Popover` driving standard action menus.
     - `NavMenu.tsx`: Radix `DropdownMenu` driving application chrome (header dropdowns, language picker).
     - `#kt_drawer` (`DrawerRoot.tsx`): Radix `Dialog` driving slide-over content panels.

---

### Component Standards & Usage Guide

| UI Element             | Standard Component          | Package          | Usage & Styling Notes                                  | Prohibited Imports                            |
| :--------------------- | :-------------------------- | :--------------- | :----------------------------------------------------- | :-------------------------------------------- |
| **Alert / Banner**     | `AlertItem`                 | `waldur-ui`      | Pure Tailwind, `--surface-card-border`, 5 variants     | `react-bootstrap` `Alert`                     |
| **Badge / Pill**       | `Badge`                     | `waldur-ui`      | 15 variants × 3 tones, structural `border-[1px]`       | `react-bootstrap` `Badge`                     |
| **Tooltip**            | `Tooltip`                   | `waldur-ui`      | Radix Tooltip (hover/focus) + Popover (click fallback) | `react-bootstrap` `Tooltip`, `OverlayTrigger` |
| **Popover**            | `Popover`, `PopoverContent` | `waldur-ui`      | Radix Popover with `--surface-card-*` tokens           | `react-bootstrap` `Popover`                   |
| **Sidebar Navigation** | `Sidebar`, `Sheet`          | `waldur-ui`      | Collapsible desktop rail + mobile Radix Sheet          | Metronic sidebar JS                           |
| **Button**             | `BaseButton` / wrappers     | `@/core/buttons` | Inset `box-shadow` border, semantic button tokens      | Direct `react-bootstrap` `Button`             |
| **Table Actions**      | `ActionsDropdown`           | `@/table`        | Radix DropdownMenu with keyboard navigation            | `react-bootstrap` `DropdownButton`            |
| **Header Chrome Menu** | `NavMenu`                   | `@/navigation`   | Radix DropdownMenu with responsive hover triggers      | N/A                                           |
| **Slide-Over Drawer**  | `DrawerRoot`                | `@/drawer`       | Radix Dialog with CSS keyframe transitions             | N/A                                           |

---

### Cascade Layers

`src/tailwind.css` imports Tailwind's `theme`, `preflight`, and `utilities` chunks separately, defining an explicit layer order:

```css
@layer theme, base, bootstrap, utilities;
```

Compiled Metronic and Bootstrap styles are wrapped in `@layer bootstrap`. The browser merges all occurrences into one virtual layer order:

1. `@layer theme` (Tailwind design tokens)
2. `@layer base` (Tailwind preflight reset)
3. `@layer bootstrap` (Bootstrap 5 & Metronic compiled styles)
4. `@layer utilities` (Tailwind generated utilities)

Placing `bootstrap` below `utilities` ensures Tailwind utility classes win specificity ties against Bootstrap rules, while remaining above `base` so preflight resets do not clobber core layout rules.

#### The Unlayered SCSS Specificity Trap

Unlayered CSS **always beats layered CSS**, regardless of selector specificity.
Vite injects component-level stylesheets (`import './Foo.scss'`) as **unlayered** styles into `<head>`.
Consequently, any selector in a component SCSS file will override styles inside `@layer bootstrap`.

> [!IMPORTANT]
> **Scoping Rule**: Component SCSS must be strictly scoped under its own unique component class (e.g. `.my-component .title`), **never** directly under a layout root (`.aside`, `.header`, `.toolbar`, `.card`). Nesting a layout class inside your own root is safe; styling an ancestor layout root directly in component SCSS breaks layout rules app-wide. Global layout overrides belong exclusively in `src/metronic/sass/custom/` inside the bootstrap layer.

#### Production Layer Optimization

In production bundles, Vite's CSS minifier removes the explicit `@layer theme, base, bootstrap, utilities;` statement because `dist/assets/index-*.css` already emits the layers in that physical order. Because Metronic's theme stylesheet is injected at runtime as an external `<link>` tag _after_ initial document parse, the layer order established by `index-*.css` remains authoritative.

---

### The `!important` & Class-Name Collision Rules

CSS Cascade Layers do **not** outrank `!important`. Bootstrap 5's utility API emits utilities with `!important` by default. Because Tailwind and Bootstrap share identical utility names, collisions occur on shared class strings:

| Colliding Class           | Bootstrap Rule (`!important`)                          | Tailwind Expected Rule               | Rendered on App Pages                  |
| :------------------------ | :----------------------------------------------------- | :----------------------------------- | :------------------------------------- |
| `.text-white`             | `color: #fff !important;`                              | `color: var(--color-white);`         | **Bootstrap** (breaks `dark:text-...`) |
| `.bg-transparent`         | `background-color: transparent !important;`            | `background-color: transparent;`     | **Bootstrap**                          |
| `.border`                 | `border: 1px solid var(--bs-border-color) !important;` | `border-width: 1px;`                 | **Bootstrap**                          |
| `.p-1` through `.p-5`     | `padding: $spacers[N] !important;`                     | `padding: calc(var(--spacing) * N);` | **Bootstrap**                          |
| `.gap-1` through `.gap-5` | `gap: $spacers[N] !important;`                         | `gap: calc(var(--spacing) * N);`     | **Bootstrap**                          |

#### Spacing Anomaly

Bootstrap defines `$spacers: (0: 0, 1: $spacer * .25, 2: $spacer * .5, 3: $spacer * .75, 4: $spacer * 0.154 * 6, 5: $spacer * 1.25)`.
At Metronic's forced root font size of `13px` (and `12px` on mobile):

- `p-1`, `p-2`, `p-3`, `p-5` render at `0.25rem × N` (`3.25px`, `6.5px`, `9.75px`, `16.25px`).
- `p-4` renders at `0.924rem` (`12.012px` on desktop, `11.088px` on mobile), whereas Tailwind's `p-4` expects `16px`.
- Steps above 20 fall through to Tailwind because Bootstrap's `$spacers` map stops at 20.

#### Practical Workaround Rules

1. **Exact Pixel Sizing**: For spacing or padding that must match design tokens precisely, use Tailwind arbitrary values: `p-[12px]`, `gap-[8px]`, `px-[16px]`.
2. **Structural Borders**: Use `border-[1px]` instead of the bare `.border` utility.
3. **White Text in Inverting Themes**: Use `text-[#fff]` instead of `text-white`. `text-[#fff]` compiles to a unique class name (`text-_fff_`) that avoids Bootstrap's `.text-white { color: #fff !important; }`, allowing dark-mode overrides (`dark:text-brand-300`) to apply correctly.

---

### Root Font-Size & Fractional Rem Scaling

Metronic's compiled CSS forces a non-standard root font size:

- Desktop (`>= 768px`): `html, body { font-size: 13px !important; }`
- Mobile (`< 768px`): `html, body { font-size: 12px !important; }`

Tailwind's default rem-based scale assumes a `16px` root. In `src/tailwind.css`, `@theme` overrides standard tokens (`--spacing`, `--text-sm`, `--text-base`, `--radius-md`, `--radius-lg`) with explicit values to compensate.

> [!WARNING]
> **Inline Styles & Rem Trap**: While Tailwind utilities can be adjusted via `@theme`, **inline styles** like `style={{ width: '18rem' }}` bypass Tailwind entirely. In standard browsers `18rem = 288px`, but in Waldur `18rem = 18 × 13px = 234px` (and `216px` on mobile). **Always use explicit pixel values (`style={{ width: '250px' }}`) for inline sizing.**

---

### The Preflight Reset Shim

Tailwind Preflight resets two core element behaviors that have no counterpart in Bootstrap:

1. `img, svg, video, canvas { display: block; }` — Drops inline SVG icons below the text baseline.
2. `ol, ul, menu { list-style: none; }` — Strips list formatting from Markdown user content (offering descriptions, Terms of Service).

`src/tailwind.css` includes a targeted `@layer bootstrap` block that restores browser defaults using `revert`:

```css
@layer bootstrap {
  img,
  svg,
  video,
  canvas,
  audio,
  iframe,
  embed,
  object {
    display: revert;
  }
  ol,
  ul,
  menu {
    list-style: revert;
  }
}
```

Using `revert` respects user-agent specifics (e.g. `audio:not([controls]) { display: none; }`) while neutralizing unwanted Preflight side-effects.

---

### Grid Breakpoint Synchronization

`src/tailwind.css` aligns Tailwind breakpoints with Bootstrap's `$grid-breakpoints` and `GRID_BREAKPOINTS` in `src/core/constants.ts`:

```css
@theme {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}
```

This guarantees `lg` resolves to `992px` identically across Tailwind `lg:` variants, Bootstrap `.d-lg-*` classes, SCSS `@include media-breakpoint-up(lg)`, and TSX `useMediaQuery()` hooks.

---

### Design Tokens & Color Systems

1. **Single Source of Truth**: All color ramps originate in `packages/design-tokens/tokens/colors.json`. Running `yarn tokens:generate` outputs:
   - `src/metronic/sass/_color-ramps.scss` (consumed by Bootstrap & Metronic SCSS)
   - `packages/design-tokens/src/colorRamps.css` (consumed by Tailwind)
2. **Theme Color Semantics**:
   - In Tailwind CSS: `--color-gray-N` maintains physical lightness across themes (e.g., `gray-900` is always dark). Dark UI uses a dedicated inverted ramp: `--color-gray-dark-N`.
   - In Metronic SCSS: `$gray-N` variables invert automatically in dark mode (`$gray-900` becomes light in dark mode).
3. **Surface & Component Tokens**:
   - `surfaceColors.css`: `--surface-card-bg`, `--surface-card-border`, `--surface-text-primary`, `--surface-text-secondary`, `--dropdown-shadow`.
   - `buttonColors.css`: Per-variant button backgrounds, borders, hover states, and focus rings.
   - `zIndex.css`: Coordinated stack order across Bootstrap and Radix layers.

---

### Brand Color Token Bridge

`src/tailwind.css` bridges runtime brand variables into Tailwind:

```css
@theme {
  --color-brand-50: var(--waldur-brand-50);
  --color-brand-500: var(--waldur-brand-500);
  --color-brand-600: var(--waldur-brand-600);
  /* ... */
}
```

These CSS variables are initialized at runtime by `afterBootstrap.tsx` (`initCssVariables()`). Storybook decorators and test harnesses must seed `--waldur-brand-*` variables so brand-dependent components render valid colors.

---

### Dark Mode Mechanics

Waldur does **not** toggle dark mode via a `.dark` HTML class. Instead:

1. `loadTheme()` in `src/theme/utils.ts` swaps the stylesheet `<link>` between `style.css` and `style.dark.css`.
2. Simultaneously, `loadTheme()` sets the `data-theme="dark"` attribute on `<html>`.
3. Tailwind dark mode is configured via an explicit variant:

```css
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
```

---

## Component Architecture & Guidelines

### AlertItem

`packages/ui/src/AlertItem.tsx` (exported from `waldur-ui`).

- **Architecture**: Pure Tailwind utilities and CSS design tokens (`--surface-card-border`).
- **Typography & Proportions**:
  - Title: `text-[1.077rem] font-medium leading-[1.43]` to match Metronic typography across desktop and mobile root font sizes.
  - Border: `var(--surface-card-border)` (`#E4E7EC` light, `#1F242F` dark).
  - Slot spacing: `gap-[0.924rem]`.
- **Enforcement**: `react-bootstrap` `Alert` is prohibited in `RESTRICTED_IMPORTS` (`eslint.config.js`), blocking direct imports and guiding call sites to `AlertItem` from `waldur-ui`.

---

### Badge

`packages/ui/src/Badge.tsx` (exported from `waldur-ui`).

- **Variants & Tones**: 15 semantic variants (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, `purple`, `blue`, `indigo`, `moss`, `pink`, `teal`, `orange`, `rose`) × 3 tones (`solid`, `light`, `outline`) × 4 shapes (`rounded`, `pill`, `circle`, `roundless`).
- **Structural 1px Border**: Uses `border-[1px]` paired with `border-transparent` on solid/light tones to maintain uniform dimensions without subpixel shift across tones.
- **Enforcement**:
  - `react-bootstrap` `Badge` is prohibited in `RESTRICTED_IMPORTS`.
  - `enforce-badge-icon-patterns`: Enforces 12px icons inside badges.
  - `enforce-badge-props-consistency`: Enforces variant/tone prop rules.
  - `no-manual-icon-colors-in-badges`: Prevents manual color classes on icons rendered inside `Badge`.
  - `enforce-badge-right-icon-pattern`: Standardizes dismiss/action icons.

---

### Tooltip

`packages/ui/src/Tooltip.tsx` (exported from `waldur-ui`).

- **Dual Engine Architecture**:
  - `trigger="hover"` (default): Uses `@radix-ui/react-tooltip` with pointer enter/leave delays and keyboard focus detection.
  - `trigger="click"`: Uses `@radix-ui/react-popover` for click-to-open tooltips (Radix Tooltip lacks click-trigger support). Styled identically as a bubble surface.
- **Seam-Free Arrow Construction**: Standard Radix SVG arrows leave an anti-aliasing hairline seam between the SVG path and the HTML popup. `Tooltip.tsx` uses a custom polygon that extends 1 viewBox unit (~0.5px) past its box with `overflow: visible` to prevent rasterization seams.
- **Adaptive Color Inversion**:
  - `theme="dark"` (default): Dark bubble with `text-[#fff]` in light mode; light bubble with dark text in dark mode.
  - `theme="light"`: Fixed dark bubble regardless of active mode.
- **Enforcement**: `Tooltip` and `OverlayTrigger` from `react-bootstrap` are prohibited in `RESTRICTED_IMPORTS`.

---

### Popover

`packages/ui/src/Popover.tsx` (exported from `waldur-ui`).

- **Design Token Styling**: Styled with semantic tokens:

  ```tsx
  className =
    'rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)] text-[var(--surface-text-primary)] outline-hidden';
  ```

- **Popover vs. DropdownMenu Principle**:
  > [!TIP]
  > **When to use Popover vs. DropdownMenu**:
  >
  > - **DropdownMenu**: Use when _every child is a command row_. A DropdownMenu owns focus with a roving tabindex and treats keystrokes as item typeahead.
  > - **Popover**: Use if the panel contains _form inputs, filters, date pickers, or interactive search fields_. DropdownMenu will intercept keystrokes typed into a nested input if they match a menu item!
- **Enforcement**: `react-bootstrap/Popover` is prohibited in `RESTRICTED_IMPORTS`.

---

### BaseButton

`packages/ui/src/BaseButton.tsx`.

- **Inset Box-Shadow Border**: A physical CSS `border` participates in `border-box` layout sizing. At a 13px root font size, fractional padding chains cause subpixel anti-aliasing variations. `BaseButton` uses an inset `box-shadow` for borders (`box-shadow: inset 0 0 0 1px ...`) to preserve pixel-perfect dimensions without shifting layout.
- **`:focus` vs. `:focus-visible`**: Uses `:focus` to match standard ring behavior (visible on click and keyboard navigation). `active:shadow-none` suppresses the ring while actively pressed.
- **State Token Matrix**: Focus rings, hover states, and active pressed colors resolve to dedicated tokens in `buttonColors.css`.

---

### Sidebar & Mobile Sheet

`packages/ui/src/Sidebar.tsx` + `Sheet.tsx`.

- **Separate Desktop and Mobile Trees**: `useIsMobile()` splits execution into two distinct branches:
  - **Desktop**: Collapsible rail with `group/panel` variants, hover expansion, and fixed positioning over an invisible spacer element.
  - **Mobile**: Rendered inside a Radix `Sheet` / `Dialog` drawer pinned to `width: 250px` (avoiding rem shrinkage).
- **Hover Expansion Mechanics**: Synchronized via React state (`isHoverExpanded`) rather than pure CSS `:hover` to prevent desynchronization during collapse animations.
- **Radix Collapsible Tree**: Built using `@radix-ui/react-collapsible` rather than `Accordion` to avoid wrapper DOM nodes that interfere with menu styling. Heights are measured dynamically via `ResizeObserver` into `--sidebar-accordion-height`.
- **The Mobile Sheet Animation Trap**:
  > [!CAUTION]
  > **Never use `forceMount` on the mobile Sheet**:
  > Radix's `DismissableLayer` registers global `pointerdown` listeners while mounted. Force-mounting the closed sheet causes its `DismissableLayer` to intercept clicks across the entire application, breaking unrelated header buttons.
  > Instead, the Sheet uses Tailwind v4's `starting:` variant (`@starting-style`), allowing elements to animate from a defined initial frame upon dynamic mounting.

---

### Content Drawer (`#kt_drawer`)

`src/drawer/DrawerRoot.tsx` wraps the shared drawer panel in Radix `Dialog.Root` and `Dialog.Content`.

- **Animation Detection via `@keyframes`**: Radix `Presence` monitors CSS `@keyframes` (`animationstart`/`animationend`) to delay unmounting. Plain CSS transitions are ignored. `_shell.scss` attaches explicit `@keyframes kt-drawer-slide-in` and `kt-drawer-slide-out` to `#kt_drawer`.
- **Width Custom Property**: Sizing is controlled via `--drawer-width`, allowing responsive full-screen toggles without direct inline style overrides.

---

### Dropdown & Menu System Map

Three systems coexist in Homeport:

1. **`src/navigation/NavMenu.tsx`**: Use for Metronic chrome (topbar user dropdown, language picker, header menus). Runs on Radix DropdownMenu/Popover wearing `.menu-sub-dropdown`.
2. **`src/table/ActionsDropdown.tsx`**: Use for table row actions and standard action menus. Runs on Radix DropdownMenu wearing `.dropdown-menu`.
3. **`packages/ui/src/DropdownMenu.tsx` & `Popover.tsx`**: Pure Tailwind/shadcn components. Use for newly built features or components migrated onto design tokens.

#### `asChild` and `forwardRef` Requirement

Radix's `Slot` clones trigger elements and attaches positioning refs and event handlers. **Every intermediate trigger component in an `asChild` hierarchy must be wrapped in `forwardRef` and spread `...props`**, or clicks will silently fail.

---

### `ActionsDropdown` & `ActionItem`

`src/table/ActionsDropdown.tsx` / `src/resource/actions/ActionItem.tsx`.

- **Keyboard Highlight Bridge**: Bootstrap targets `.dropdown-item:hover, .dropdown-item:focus`. Radix manages focus and sets `[data-highlighted]`. `_dropdown.scss` maps `[data-highlighted]` onto Bootstrap's hover treatment so arrow-key navigation displays the active highlight.
- **Isolated Row Testing**: Exported helper `inActionsMenu(children)` wraps action rows in a headless Radix Menu for Vitest unit tests without needing an entire table harness.

---

### `NavMenu`

`src/navigation/NavMenu.tsx`.

- **Theme Bridges**: Bridges `menu-state-bg-gray`, `menu-state-bg-light`, and `menu-state-title-primary` onto Radix `[data-highlighted]`.
- **Top-Level Hover Menus**: `useHoverMenu()` replicates responsive hover behavior with a 200ms close delay.
- **Separation of `.menu-item` and `.menu-link`**: Radix props attach to the inner `.menu-link` element; the outer `.menu-item` remains a layout container.

---

## Linting & Guardrails

### Restricted Imports

Configured in `eslint.config.js` via `no-restricted-imports`:

```javascript
const RESTRICTED_IMPORTS = [
  {
    name: 'react-bootstrap',
    importNames: ['Badge'],
    message: 'Use Badge from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Badge',
    message: 'Use Badge from "waldur-ui" instead of react-bootstrap/Badge.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Tooltip'],
    message: 'Use Tooltip from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Tooltip',
    message: 'Use Tooltip from "waldur-ui" instead of react-bootstrap/Tooltip.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['OverlayTrigger'],
    message:
      'Use Tooltip or Popover from "waldur-ui" instead of react-bootstrap/OverlayTrigger.',
  },
  {
    name: 'react-bootstrap/OverlayTrigger',
    message:
      'Use Tooltip or Popover from "waldur-ui" instead of react-bootstrap/OverlayTrigger.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Popover'],
    message: 'Use Popover from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Popover',
    message: 'Use Popover from "waldur-ui" instead of react-bootstrap/Popover.',
  },
  {
    name: 'react-bootstrap',
    importNames: ['Alert'],
    message: 'Use AlertItem from "waldur-ui" instead of react-bootstrap.',
  },
  {
    name: 'react-bootstrap/Alert',
    message: 'Use AlertItem from "waldur-ui" instead of react-bootstrap/Alert.',
  },
];
```

---

### Custom ESLint Rules Matrix

Implemented in `packages/eslint-plugin-waldur`:

| Rule Name                             | Severity | Enforced Pattern                                                                                        |
| :------------------------------------ | :------- | :------------------------------------------------------------------------------------------------------ |
| `enforce-badge-icon-patterns`         | `error`  | Enforces 12px icon sizing inside `Badge` components.                                                    |
| `enforce-badge-props-consistency`     | `error`  | Validates valid combinations of `variant`, `tone`, and `shape` props on `Badge`.                        |
| `no-manual-icon-colors-in-badges`     | `error`  | Prevents manual color classes on icons rendered inside `Badge`.                                         |
| `enforce-badge-right-icon-pattern`    | `error`  | Standardizes right-side action icon styling in badges.                                                  |
| `no-direct-bootstrap-button`          | `error`  | Prohibits importing `Button` directly from `react-bootstrap`.                                           |
| `enforce-button-variants`             | `error`  | Enforces valid semantic button variants on Waldur button wrappers.                                      |
| `no-bootstrap-button-markup`          | `warn`   | Flags native `<button className="btn ...">` markup; guides conversion to `BaseButton` wrappers.         |
| `no-direct-bootstrap-dropdown-button` | `error`  | Prohibits `react-bootstrap/DropdownButton`.                                                             |
| `enforce-actions-dropdown-in-tables`  | `warn`   | Steers table action buttons toward `ActionsDropdown`.                                                   |
| `no-hand-rolled-table`                | `warn`   | Flags bare `<table>` elements that should use Waldur Table components.                                  |
| `no-hand-rolled-modal-footer`         | `error`  | Enforces standard modal footer wrappers instead of custom flex rows.                                    |
| `enforce-dialog-button-order`         | `error`  | Enforces primary/cancel button order in dialog footers.                                                 |
| `enforce-featured-icon`               | `error`  | Requires `FeaturedIcon` for highlighted icon emblems.                                                   |
| `enforce-border-radius-tokens`        | `error`  | Prohibits arbitrary radius classes in favor of design tokens.                                           |
| `enforce-nav-tabs-pattern`            | `error`  | Standardizes navigation tab markup and active states.                                                   |
| `enforce-breadcrumb-colors`           | `error`  | Enforces semantic token colors on breadcrumbs.                                                          |
| `enforce-formcheck-components`        | `error`  | Enforces standard form check wrappers.                                                                  |
| `enforce-phosphor-icon-weight`        | `error`  | Enforces consistent icon weight across Phosphor icons.                                                  |

---

## Storybook & Testing Toolchain

### Storybook Environment & Vitest

- **Dev Server**: `yarn storybook` (port 6006)
- **Production Build**: `yarn build-storybook`
- **Vitest Runner**: `yarn test:storybook` (runs every story through Playwright browser assertions).
- **Concurrency Gotcha**: When running Vitest against Storybook while a Storybook dev server is active, always prefix the command with `CHOKIDAR_USEPOLLING=1` to prevent inotify file-watcher limits:

  ```bash
  CHOKIDAR_USEPOLLING=1 yarn vitest run --project=storybook
  ```

---

### Visual Parity Test Suite

Directly compares legacy and new component implementations side-by-side using Playwright screenshots (`e2e-visual/base-button-parity.spec.ts`):

```bash
yarn playwright test base-button-parity --project visual --workers=1
```

Note: `--workers=1` is required to avoid memory exhaustion during parallel canvas rasterization.

**Coverage**: 12 variants × 2 sizes × 2 themes × 6 interaction states (`enabled`, `disabled`, `hover`, `active`, `.focus()`, `.click()`) = 288 test cases.

**Verification Steps**:

1. **Dimension Parity**: Compares `locator.boundingBox()` with `MAX_DIMENSION_SLACK_PX = 0.5px` (avoids PNG rounding noise).
2. **Pixelmatch Ratio**: Checks diff pixel ratio with `DIFF_RATIO_THRESHOLD = 0.16` and per-pixel threshold `0.25`.
3. **Dominant-Color Chromaticity**: Evaluates color hue balance across RGB channels (`CHROMATICITY_TOLERANCE = 10`) to catch tint errors on small text-only buttons where pixel ratios are low.

---

### Testing Gotchas & Pitfalls

1. **CSS Transitions Require a Paint**: Calling `getComputedStyle()` synchronously after `.hover()` or `.focus()` returns pre-transition values. Test harnesses must disable animations via injected CSS or wait for transition settling.
2. **jsdom Mocking**:
   - `ResizeObserver`: jsdom lacks `ResizeObserver`. Tests rendering `Collapsible` or `Sidebar` must mock it:

     ```typescript
     vi.stubGlobal(
       'ResizeObserver',
       class {
         observe() {}
         unobserve() {}
         disconnect() {}
       },
     );
     ```

   - `matchMedia`: `react-responsive` captures `window.matchMedia` at module load time. Mock `react-responsive` directly rather than mutating `window.matchMedia`:

     ```typescript
     vi.mock('react-responsive', () => ({ useMediaQuery: vi.fn() }));
     ```

3. **Headless Browser Animation Polling**: CDP/Playwright tabs in automated modes skip compositing animation frames if backgrounded. `setTimeout` polling of `getAnimations()` may read `currentTime: 0`. Trigger a screenshot capture or force a reflow to guarantee paint completion.
