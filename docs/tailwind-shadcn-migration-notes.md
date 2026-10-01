# Tailwind & shadcn UI Architecture

Architectural reference and design system manual for Tailwind CSS v4, shadcn UI, and Radix UI in Waldur Homeport. Documents runtime framework coexistence, design tokens, component architecture, styling conventions, the button migration and its aftermath, and linting guardrails.

> [!NOTE]
> **Status**: every button in the app is rendered by `BaseButton` (or by `buttonVariants()` on an element that cannot be a `BaseButton`), and the legacy Bootstrap/Metronic `.btn` CSS has been deleted. The remaining Bootstrap-backed UI is layout, forms, tables, modals and the dropdown/menu shells listed under [Component Systems Overview](#component-systems-overview). New UI is built on `waldur-ui`.

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
   - [Buttons](#buttons)
   - [Sidebar & Mobile Sheet](#sidebar-mobile-sheet)
   - [Content Drawer (`#kt_drawer`)](#content-drawer-kt-drawer)
   - [Dropdown & Menu System Map](#dropdown-menu-system-map)
   - [ActionsDropdown & ActionItem](#actionsdropdown-actionitem)
   - [NavMenu](#navmenu)
3. [Legacy Button CSS Retirement](#legacy-button-css-retirement)
4. [Linting & Guardrails](#linting-guardrails)
   - [Restricted Imports](#restricted-imports)
   - [Custom ESLint Rules Matrix](#custom-eslint-rules-matrix)
5. [Storybook & Testing Toolchain](#storybook-testing-toolchain)
   - [Storybook Environment & Vitest](#storybook-environment-vitest)
   - [Visual E2E Specs](#visual-e2e-specs)
   - [Retired Visual Parity Suite](#retired-visual-parity-suite)
   - [Testing Gotchas & Pitfalls](#testing-gotchas-pitfalls)

---

## UI Architecture & Framework Coexistence

### Component Systems Overview

Waldur Homeport operates on two active UI component patterns:

1. **Modern Tailwind / Radix Primitives (`packages/ui`, exported as `waldur-ui`)**
   - Built with pure Tailwind v4 utilities and CSS design tokens from `packages/design-tokens`.
   - Free of all Bootstrap and Metronic classes, SCSS variables, and runtime mixins.
   - Includes `BaseButton`, `SegmentedControl`, `AlertItem`, `Badge`, `Tooltip`, `Popover`, `Sidebar`, `Sheet`, `Dialog`, `DropdownMenu`, `Switch`, `Tag`, `Card`, `Avatar`, `Toast`, `FeaturedIcon`, `StatusPill`, `StatCard`, `CopyButton`, `LoadingSpinner`, `Accordion`, `AccordionCard`, and `Collapsible`.
   - Exports `buttonVariants()`, `ButtonVariant` and `ButtonSize` so elements that cannot be a `BaseButton` (links, Radix triggers that need a specific child shape) still get the exact same classes.

2. **Transitional Shells (Radix Engine with Themed Skins)**
   - Used where extensive surface area requires maintaining existing container styling while leveraging accessible Radix primitives:
     - `ActionsDropdown.tsx` / `ActionItem.tsx`: Radix `DropdownMenu` and `Popover` driving standard action menus.
     - `NavMenu.tsx`: Radix `DropdownMenu` driving application chrome (header dropdowns, language picker).
     - `#kt_drawer` (`DrawerRoot.tsx`): Radix `Dialog` driving slide-over content panels.
   - These still wear Bootstrap/Metronic panel classes (`.dropdown-menu`, `.menu-sub-dropdown`); only their _buttons_ have moved to `waldur-ui`.

---

### Component Standards & Usage Guide

| UI Element                    | Standard Component          | Package        | Usage & Styling Notes                                                                              | Prohibited                                                  |
| :---------------------------- | :-------------------------- | :------------- | :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **Alert / Banner**            | `AlertItem`                 | `waldur-ui`    | Pure Tailwind, `--surface-card-border`, 5 variants                                                 | `react-bootstrap` `Alert`                                   |
| **Badge / Pill**              | `Badge`                     | `waldur-ui`    | 15 variants × 3 tones, structural `border-[1px]`                                                   | `react-bootstrap` `Badge`                                   |
| **Tooltip**                   | `Tooltip`                   | `waldur-ui`    | Radix Tooltip (hover/focus) + Popover (click fallback)                                             | `react-bootstrap` `Tooltip`, `OverlayTrigger`               |
| **Popover**                   | `Popover`, `PopoverContent` | `waldur-ui`    | Radix Popover with `--surface-card-*` tokens                                                       | `react-bootstrap` `Popover`                                 |
| **Button**                    | `BaseButton`                | `waldur-ui`    | 12 variants × 3 sizes, inset `box-shadow` border, outline focus ring, semantic button tokens       | `react-bootstrap` `Button`, hand-written `btn` class markup |
| **Link styled as button**     | `Link` with `buttonVariant` | `@/core/Link`  | Same classes as `BaseButton` via `buttonVariants()`; keeps anchor semantics and routing            | `<a className="btn …">`                                     |
| **Mutually exclusive choice** | `SegmentedControl`          | `waldur-ui`    | Radix RadioGroup, `neutral` / `brand` variants, button sizes                                       | `react-bootstrap` `ToggleButtonGroup`, `btn-group` markup   |
| **Expandable panel group**    | `Accordion`                 | `waldur-ui`    | Radix Accordion, `single` / `multiple`, open header in runtime brand colour; closed panels unmount | `react-bootstrap` `Accordion`                               |
| **Single expandable panel**   | `Collapsible`               | `waldur-ui`    | Radix Collapsible, unstyled; `keepMounted` keeps form fields mounted while closed                  | `react-bootstrap` `Collapse`, `useAccordionButton`          |
| **Sidebar Navigation**        | `Sidebar`, `Sheet`          | `waldur-ui`    | Collapsible desktop rail + mobile Radix Sheet                                                      | Metronic sidebar JS                                         |
| **Table Actions**             | `ActionsDropdown`           | `@/table`      | Radix DropdownMenu with keyboard navigation                                                        | `react-bootstrap` `DropdownButton`                          |
| **Header Chrome Menu**        | `NavMenu`                   | `@/navigation` | Radix DropdownMenu with responsive hover triggers                                                  | N/A                                                         |
| **Slide-Over Drawer**         | `DrawerRoot`                | `@/drawer`     | Radix Dialog with CSS keyframe transitions                                                         | N/A                                                         |

The _Prohibited_ column is convention; the subset that lint enforces is listed under [Linting & Guardrails](#linting-guardrails) (`ToggleButtonGroup` and `btn-group` markup are not).

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

### Accordion & Collapsible

`packages/ui/src/Accordion.tsx` and `packages/ui/src/Collapsible.tsx` (exported from `waldur-ui`).

- **Accordion** is the shadcn recipe on Radix Accordion: each trigger is a real `<button>` inside an `<h3>` (Bootstrap/Metronic heading margin and type reset), with `aria-expanded`/`aria-controls` and arrow/Home/End keys between headers. Use `type="multiple"` where several panels stay open (table filters sidebar).
- **Brand colour**: the open header is `text-brand-700` / `dark:text-brand-200`, the runtime tenant ramp. The chevron is a Phosphor icon in `currentColor`, so it always matches — react-bootstrap's version baked the build-time default green into a data-URI SVG.
- **Motion**: 250ms ease-out slide. Accordion and plain Collapsible use `waldur-collapsible-down/-up` in `waldur-design-tokens/animations.css`, driven by Radix's `--radix-collapsible-content-height`; `overflow: hidden` lives in the keyframes so an open panel lets inline select menus overflow it. `Collapsible keepMounted` (its children stay mounted, so Radix's Presence can't drive keyframes) transitions grid rows 0fr ↔ 1fr instead, clipping only mid-slide and applying `hidden` once closed. Both respect `prefers-reduced-motion`.
- **Unmount vs. `keepMounted`**:
  > [!WARNING]
  > Radix renders `isOpen && children` inside its Content, so a closed panel's children are **unmounted even with `forceMount`**. react-final-form fields inside it unregister and lose their values and validation. For panels holding form fields, use `<Collapsible keepMounted>`: children stay mounted and are only `hidden` while closed. `Accordion` has no such option — none of its intended users hold form fields.
- **Call sites**: the table filters sidebar (`Accordion type="multiple"`), `AccordionCard` (now in `waldur-ui`; `Collapsible keepMounted`, same props as before; pure Tailwind with rem spacing ported from Metronic's card, and `--card-header-text` / `--card-title-text` / `--card-title-secondary-text` / `--card-header-solid-bg` tokens in `surfaceColors.css` — measured identical to the Metronic card in light and dark), `CategoriesPanel` (`Collapsible`) and a handful of standalone accordions, which add an outer border via `className` (`rounded-md border-[1px] border-solid border-[var(--surface-card-border)]`) — the component itself draws only separators between items.
- **Enforcement**: `Accordion`, `AccordionContext` and `useAccordionButton` from `react-bootstrap` (and `react-bootstrap/Accordion`) are prohibited in `RESTRICTED_IMPORTS`.

---

### Buttons

Three primitives in `waldur-ui` (`packages/ui/src`) and `Link` in `@/core/Link` make up the application's unified button architecture:

| Primitive                     | Role & Use Case                                                                    | Package / Location |
| :---------------------------- | :--------------------------------------------------------------------------------- | :----------------- |
| `BaseButton`                  | Standard action buttons across dialogs, tables, and page headers                   | `waldur-ui`        |
| `buttonVariants()`            | Shared CVA styling applied to non-button elements (router links, dropdown toggles) | `waldur-ui`        |
| `SegmentedControl`            | Mutually exclusive view switchers (Radix RadioGroup)                               | `waldur-ui`        |
| `Link` (with `buttonVariant`) | State-based router navigation styled with button aesthetics                        | `@/core/Link`      |

`ButtonVariant` and `ButtonSize` are derived directly from the `cva` definition (`VariantProps<typeof buttonVariants>`), guaranteeing types stay synchronized with rendered classes.

#### Architectural Highlights

- **Integer Heights & Inset Borders**: Decoupled from physical CSS `border-box` calculations via `shadow-[inset_0_0_0_1px_var(...)]`, guaranteeing exact heights: 28px (`sm`), 36px (`md`, default), and 44px (`lg`).
- **Direct Tooltip Integration**: `buttonVariants` does not declare `disabled:pointer-events-none`; instead, it pairs `disabled:cursor-not-allowed` with matching `data-disabled:*` styles. `<BaseButton>` passes `data-disabled` and wraps `<button>` inside `<Tooltip>` with **zero wrapper `<span>` elements**, eliminating flexbox alignment bugs (`self-center`, `w-100`).
- **Outline Focus Rings**: Focus indicators use native CSS `outline` (`focus-visible:[outline:2px_solid_var(...)]`) for forced-colors compatibility and resistance to container resets.
- **Toggles in `ActionsDropdown`**: Dropdown toggles render a direct `<button>` with `buttonVariants()` (rather than `BaseButton`) so the rotating caret (`rotate-toggle-180`) remains an immediate child for CSS animation.
- **SegmentedControl**: Built on Radix RadioGroup (<kbd>←</kbd>/<kbd>→</kbd> select, single <kbd>Tab</kbd> stop) with `inline-flex self-center` preventing layout stretching.

> [!TIP]
> **Authoritative Guide**: For complete variant tokens, full prop specifications, icon sizing rules, dropdown toggle architecture, and the call-site conversion guide, see the dedicated [Button UI Guide](button-ui-guide.md).

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
- **Toggle buttons use `buttonVariants()`, not `BaseButton`**: `TableDropdownToggle` / `AddDropdownToggle` in this file and `Toggle` in `ActionDropdownButton.tsx` render a raw `<button>` carrying `buttonVariants()` classes. The caret span (`rotate-toggle-180`) must be a _direct_ child of the button for `_dropdown.scss`'s `.dropdown-toggle[data-state='open'] > .rotate-toggle-180` selector, and `BaseButton` wraps `iconNode` in an extra span. Their icons are sized with the Phosphor `size` prop (16.25px `sm`, 19.5px otherwise) rather than a `.svg-icon` wrapper.
- **Classes the toggles keep**: `dropdown-toggle` and `no-arrow`, because `.disabled-view` and `custom/_table.scss` still key off the literal `dropdown-toggle` class, and — on the icon-only toggle — a bare `btn-icon` marker, which is inert for styling but is the other half of `.disabled-view`'s `.dropdown-toggle.btn-icon { display: none }` rule.
- **Panel still on Bootstrap**: the menu panel (`.dropdown-menu` / `.dropdown-item`) is unchanged; only the trigger moved to `waldur-ui` tokens.

---

### `NavMenu`

`src/navigation/NavMenu.tsx`.

- **Theme Bridges**: Bridges `menu-state-bg-gray`, `menu-state-bg-light`, and `menu-state-title-primary` onto Radix `[data-highlighted]`.
- **Top-Level Hover Menus**: `useHoverMenu()` replicates responsive hover behavior with a 200ms close delay.
- **Separation of `.menu-item` and `.menu-link`**: Radix props attach to the inner `.menu-link` element; the outer `.menu-item` remains a layout container.

---

## Legacy Button CSS Retirement

Once no element rendered a literal `.btn` class, the Bootstrap/Metronic button CSS was deleted.

### Removed

- `@import 'bootstrap/scss/buttons'` and Metronic's `core/components/buttons/_theme.scss`.
- The `.btn` portion of `core/components/buttons/_base.scss`, the button-variant mixins (`mixins/_buttons.scss`), the `$button-variants` map and `$btn-extended-variants`.
- The `.btn` block of `custom/_buttons.scss`, plus every compound `.btn …` rule in `custom/_base`, `_content`, `_modal`, `_table`, core `_nav` and `_print-mode`, `PageBarTabs.scss`, `PublicOfferingPricing.scss` and the glass/neumorphism layout sheets.
- Earlier: `.btn-group` (with `@import 'bootstrap/scss/button-group'`), replaced by `SegmentedControl`, and `ToolbarButton`.

**How it was verified**: the compiled stylesheet (light and dark) was diffed before and after. About 9,000 rules disappeared, every one with `.btn` in its selector; nothing else changed, and nothing new appeared. Deleting CSS this way is safe only because the rules were _compound_ with `.btn` — a selector such as `.btn.btn-icon.btn-sm` cannot match an element without the literal class. Repeat the diff (fetch the compiled sheet from the dev server with `?direct`, then compare rules with `postcss`) before deleting more.

### Kept

These do not depend on `.btn`:

| Class                                             | Why it stays                                                                                                                                                                                                     |
| :------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.btn-no-focus`                                   | Standalone helper in `core/components/buttons/_base.scss` that callers pass as a plain `className` to a `BaseButton`. Removes the box-shadow glow only; `BaseButton`'s focus ring is an outline, so it survives. |
| `.btn-nav-item`                                   | Header icon buttons (`custom/_nav.scss`)                                                                                                                                                                         |
| `.btn-close`                                      | Bootstrap's modal close control (`bootstrap/scss/close`)                                                                                                                                                         |
| `.btn-text-align`                                 | Text alignment helper used on a `div`                                                                                                                                                                            |
| `.dropdown-toggle.btn-icon`                       | `.disabled-view` rule that hides row-action toggles (see [`ActionsDropdown`](#actionsdropdown-actionitem))                                                                                                       |
| `$btn-*` SCSS variables and `_tokens.scss` values | Still read by AI-assistant and other component styles                                                                                                                                                            |

**Guardrail**: `no-bootstrap-button-markup` is an error with no allowlist, so hand-written `btn` markup cannot come back unnoticed (see [Custom ESLint Rules Matrix](#custom-eslint-rules-matrix)).

**Known consequence**: the deleted rules also carried some sizes that had already stopped applying to `BaseButton`s (44px modal-footer and toolbar buttons, a 150px footer minimum width). Deleting them changed nothing on screen, but it means a button that should be large must say so with `size="lg"`.

---

## Linting & Guardrails

### Restricted Imports

Configured in `eslint.config.js` via `no-restricted-imports` (`RESTRICTED_IMPORTS`). Each entry has a `message` that names the replacement:

| `react-bootstrap` import                              | Use instead                                                                            |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `Badge`                                               | `Badge` from `waldur-ui`                                                               |
| `Tooltip`, `OverlayTrigger`                           | `Tooltip` (or `Popover`) from `waldur-ui`                                              |
| `Popover`                                             | `Popover` from `waldur-ui`                                                             |
| `Alert`                                               | `AlertItem` from `waldur-ui`                                                           |
| `Button`                                              | `BaseButton` from `waldur-ui` (or `SubmitButton` / `CloseDialogButton` where they fit) |
| `DropdownButton`                                      | `ActionsDropdown`                                                                      |
| `Accordion`, `AccordionContext`, `useAccordionButton` | `Accordion` or `Collapsible` from `waldur-ui`                                          |

Each is blocked both as a named import from `react-bootstrap` and as a deep import (`react-bootstrap/Badge`, …). A genuinely new exception belongs on the offending line as `// eslint-disable-next-line no-restricted-imports -- <reason>`.

Import restrictions only see imports. A button hand-written as `<button className="btn btn-danger">` imports nothing, so it is caught by the custom rule `no-bootstrap-button-markup` below.

---

### Custom ESLint Rules Matrix

Implemented in `packages/eslint-plugin-waldur` and enabled as `waldur-custom/*` in `eslint.config.js`. Rules marked `warn` steer new code while existing violations (over a hundred hand-rolled tables, for example) are converted one screen at a time; promote them to `error` when the count reaches zero.

#### Buttons, dialogs and tables

| Rule Name                            | Severity | Enforced Pattern                                                                                                                                    |
| :----------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-bootstrap-button-markup`         | `error`  | Flags `btn` as a class token on a native `<button>`, `<a>`, `<input>` or `<label>`. No allowlist: use `BaseButton`, or `Link` with `buttonVariant`. |
| `enforce-disabled-button-tooltip`    | `error`  | A disabled `BaseButton` needs a `tooltip` or `disabledReason` explaining why.                                                                       |
| `no-edit-button-size-override`       | `error`  | Prevents `size="sm"` on `EditButton`; use `CompactEditButton`.                                                                                      |
| `enforce-dialog-button-order`        | `error`  | Dismissive actions first, primary submission/approval last (rightmost) in dialog footers.                                                           |
| `no-hand-rolled-modal-footer`        | `error`  | Prefer `ModalDialog`'s `footer` prop over hand-rolling action buttons inside its children.                                                          |
| `enforce-actions-dropdown-in-tables` | `warn`   | Steers table row actions toward `ActionsDropdown`.                                                                                                  |
| `no-hand-rolled-table`               | `warn`   | Prefer `@/table/Table` over `react-bootstrap` `Table` or raw `<table>` markup.                                                                      |
| `enforce-noresult-with-cta`          | `error`  | `NoResult` empty states need an actionable call-to-action button.                                                                                   |
| `enforce-render-field-or-dash`       | `error`  | Table cells use `renderFieldOrDash()` for empty values.                                                                                             |

#### Visual patterns

| Rule Name                          | Severity | Enforced Pattern                                                           |
| :--------------------------------- | :------- | :------------------------------------------------------------------------- |
| `enforce-badge-icon-patterns`      | `error`  | Enforces 12px icon sizing inside `Badge` components.                       |
| `enforce-badge-props-consistency`  | `error`  | Validates `variant`, `tone` and `shape` prop combinations on `Badge`.      |
| `no-manual-icon-colors-in-badges`  | `error`  | Prevents manual colour classes on icons rendered inside `Badge`.           |
| `enforce-badge-right-icon-pattern` | `error`  | Standardizes right-side action icon styling in badges.                     |
| `enforce-featured-icon`            | `error`  | Requires `FeaturedIcon` (with `tone`/`size`) for highlighted icon emblems. |
| `enforce-phosphor-icon-weight`     | `error`  | Consistent `weight` prop on Phosphor icons.                                |
| `enforce-border-radius-tokens`     | `error`  | Design-token radius classes instead of hard-coded values.                  |
| `enforce-nav-tabs-pattern`         | `error`  | Navigation tabs use the `nav-line-tabs` class.                             |
| `enforce-breadcrumb-colors`        | `error`  | Breadcrumb links use the `$text-brand-secondary` token.                    |
| `enforce-formcheck-components`     | `error`  | React Bootstrap `FormCheck` instead of custom form-control markup.         |

#### Code hygiene

| Rule Name                        | Severity | Enforced Pattern                                                                                                                  |
| :------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `no-direct-client-usage`         | `error`  | No direct use of low-level API client methods.                                                                                    |
| `no-direct-field-adapter`        | `error`  | Adapter components are not passed straight to `Field`'s `component` prop.                                                         |
| `no-template-in-translate`       | `error`  | No template literals or concatenation inside `translate()` calls.                                                                 |
| `prefer-classnames-utility`      | `error`  | Use `classNames()` instead of manual `className` string concatenation.                                                            |
| `no-redundant-vi-mock`           | `error`  | No `vi.mock` for modules that are already mocked globally.                                                                        |
| `no-undefined-in-mutation-body`  | `warn`   | Do not collapse a request-body field to `undefined`: the key is dropped and clearing the field becomes a silent no-op.            |
| `prefer-mutate-over-mutateAsync` | `warn`   | Buttons and action items (`BaseButton`, `ActionItem`, …) call `.mutate()`; keep `.mutateAsync()` for forms that need the promise. |

The former `enforce-button-variants` rule was deleted: the variant list lives in the `ButtonVariant` type, so the compiler enforces it.

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

- **Stories to look at**: `Actions/BaseButton` (`packages/ui/src/BaseButton.stories.tsx`: playground, every state, sizes, icon-only, realistic usage), `Actions/SegmentedControl` (variants, sizes, `BesideTallerSibling`, `AsTabsWithPanels`), and `src/table/ActionsDropdown.stories.tsx`.
- **Storybook is not the app**: it applies the theme through `storybook-addon-pseudo-states`, which rewrites `:focus-visible` / `:hover` selectors. See the pitfall below before trusting a `:not(:focus-visible)` result there.

---

### Visual E2E Specs

`yarn test:e2e:visual` runs `e2e-visual/*.spec.ts` through Playwright (project `visual`, against the app on :8001 and Storybook on :6006).

- **`focus-ring.spec.ts`**: asserts that keyboard focus produces a _visible_ indicator with at least 3:1 contrast (WCAG 2.4.7 and 1.4.11), in light and dark. Its fixtures are built from `buttonVariants()` on the `actions-basebutton--playground` story's stylesheet and cover the places a ring was once suppressed: elevation utilities (`shadow-sm`), an unlayered page stylesheet setting a `box-shadow`, `.menu-link` and `nav-line-tabs`. The `primary` case is a recorded contrast gap (`test.fail()`): a brand ring on a brand-filled button is about 1.6:1. `.btn-no-focus` is deliberately not a fixture — see the pseudo-states pitfall.
- **`stat-card-parity.spec.ts`**, **`charts.spec.ts`**, **`wizards.spec.ts`**: parity and screenshot checks for other components; `visualParityHarness.ts` holds the shared pixel-diff and chromaticity helpers.

Run one spec with `yarn playwright test focus-ring --project=visual --workers=1` (a filter, not a path; passing a path is read as a project name). Playwright executes specs in Node, so a spec may import `packages/ui/src/BaseButton` directly but not the `waldur-ui` barrel, whose modules touch `document` at import time.

---

### Retired Visual Parity Suite

`e2e-visual/base-button-parity.spec.ts` compared the legacy Bootstrap `BaseButton` against the new Tailwind/shadcn one side-by-side via Playwright screenshots, pixel-diffing 288 variant/size/theme/state combinations, so the new component could be proven a drop-in replacement before any call site used it. Every call site has migrated and the legacy component is deleted, so the spec, its dedicated CI job and its Storybook story (`BaseButtonParity.stories.tsx`) were removed together.

The techniques it validated remain a useful reference for the next component swap: dimension parity via `boundingBox()`, a pixelmatch ratio, and dominant-colour chromaticity for low-pixel-ratio text-only buttons (implemented in `visualParityHarness.ts`, still used by `stat-card-parity.spec.ts`).

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
4. **Tailwind only generates classes it can read literally**: Tailwind v4 scans source files for complete class strings. A class assembled at runtime (`` `[&>svg]:h-[${px}]` ``) is never generated, so it silently does nothing. `BaseButton`'s icons rendered at 16px instead of 20px for exactly this reason. Write the class as a literal and pass the varying part through a CSS custom property (`style={{ '--icon-size': px }}` with `[&>svg]:h-[var(--icon-size)]`), or choose between whole literal classes. Classes inside HTML strings (chart tooltips) are scanned too, provided they are literals — `buttonVariants()` returns literals.
5. **Compound Bootstrap selectors are dead without the parent class**: most Metronic rules are written `.btn.btn-sm { … }` or `.btn { &.btn-icon { … } }`. Adding `btn-sm` to an element that lacks `.btn` does nothing, and a hand-rolled `Link`/`div` that dropped `.btn` loses the rule with no error. Grep the SCSS for the class before relying on it; prefer `variant`/`size` props.
6. **A different tree shape at the same position remounts**: a component that returns `<Wrapper>{child}</Wrapper>` on one render and bare `child` on the next makes React discard and recreate `child`, losing focus and any ref held on it. The filter button's count badge did this until it got a wrapper that is always mounted; `BaseButton`'s tooltip uses `alwaysMount` for the same reason. If a control's focus is lost when a badge or tooltip appears, look for this.
7. **A flex row stretches its children**: `align-items: stretch` is the default, so a control with no explicit height grows to the tallest sibling. A `SegmentedControl` measured 36px in isolation and 44px in a toolbar. Give shared controls `self-center` (or an explicit size) instead of relying on the host row.
8. **Cascade layers invert for `!important`**: in `@layer bootstrap`, an `!important` declaration beats Tailwind utilities (a later layer) because important declarations reverse layer order. That is why `.btn-no-focus { box-shadow: none !important }` removes a `BaseButton`'s inset border, and why an override meant to win over a Tailwind utility from the `bootstrap` layer must itself be `!important`.
9. **Storybook rewrites pseudo-classes**: `storybook-addon-pseudo-states` turns `:not(:focus-visible)` into `:not(.pseudo-focus-visible)`, which matches every element, so a rule such as `.btn-no-focus:not(:focus-visible) { outline: none !important }` suppresses the outline permanently _in Storybook_ while behaving correctly in the app. Measure focus and hover behaviour against the running app (the dev server on :8001) before changing CSS on the strength of a Storybook or `e2e-visual` result.
10. **Radix RadioGroup in jsdom**: arrow keys move _and_ select only while the key is held. With `userEvent`, use `keyboard('{ArrowRight>}')` (press without release) followed by `waitFor`, not `keyboard('{ArrowRight}')`. Radix `Tabs` reports `data-state="active"`, a `RadioGroup` item `data-state="checked"`.
11. **Test conventions**: mock the current user with `vi.mocked(useUser).mockReturnValue(…)` — `@/workspace/hooks` is mocked globally, and a local `vi.mock` of it trips `no-redundant-vi-mock`. Testing Library's `no-node-access` rule forbids `.querySelector`/`.closest` in tests; reach elements by role, label or text. Prove a new regression test by reverting the fix and watching it fail.
