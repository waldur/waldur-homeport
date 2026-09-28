# Button UI & Design System Guide

Comprehensive architectural reference, design system manual, and practical usage guide for all button UI in Waldur HomePort. This guide covers `BaseButton`, `buttonVariants()`, direct tooltip integration, design tokens, links styled as buttons, dropdown toggles, segmented controls, accessibility models, and linting guardrails.

---

## Table of Contents

1. [Architecture & Design Philosophy](#1-architecture-design-philosophy)
   - [Unified Button Engine](#unified-button-engine)
   - [Integer Height System](#integer-height-system)
   - [Inset Box-Shadow Border Mechanics](#inset-box-shadow-border-mechanics)
   - [Transitions & Easing](#transitions-easing)
   - [Focus Ring & Forced-Colors Accessibility](#focus-ring-forced-colors-accessibility)
   - [Active State Press Dynamics](#active-state-press-dynamics)
2. [The 12 Button Variants & Design Tokens](#2-the-12-button-variants-design-tokens)
   - [Solid & Bordered Variants](#solid-bordered-variants)
   - [Text Variants](#text-variants)
   - [Design Token Architecture & Dark Theme Inversion](#design-token-architecture-dark-theme-inversion)
   - [Complete Token Mapping Reference](#complete-token-mapping-reference)
3. [Tooltips, Disabled States & Direct DOM Integration](#3-tooltips-disabled-states-direct-dom-integration)
   - [Why `data-disabled` and Direct Tooltips Replace Wrapper Spans](#why-data-disabled-and-direct-tooltips-replace-wrapper-spans)
   - [The `alwaysMount` Lifecycle Guarantee](#the-alwaysmount-lifecycle-guarantee)
   - [Explaining Unavailable Actions (`disabledReason` vs `tooltip`)](#explaining-unavailable-actions-disabledreason-vs-tooltip)
   - [Lint Enforcement: `enforce-disabled-button-tooltip`](#lint-enforcement-enforce-disabled-button-tooltip)
4. [Icons, Typography & Loading States](#4-icons-typography-loading-states)
   - [Phosphor Icon Integration](#phosphor-icon-integration)
   - [Exact SVG Sizing via Standard Tailwind Classes](#exact-svg-sizing-via-standard-tailwind-classes)
   - [Icon-Only Square Buttons](#icon-only-square-buttons)
   - [Loading Spinner Mechanics (`pending`)](#loading-spinner-mechanics-pending)
   - [Prohibition of `.svg-icon` Wrappers](#prohibition-of-svg-icon-wrappers)
5. [Links Rendered as Buttons](#5-links-rendered-as-buttons)
   - [Supported Link Props](#supported-link-props)
   - [Text-Anchor Suppression](#text-anchor-suppression)
   - [Specialized Entity Link Wrappers](#specialized-entity-link-wrappers)
   - [Prohibited Link Button Patterns](#prohibited-link-button-patterns)
6. [Dropdown & Menu Toggles](#6-dropdown-menu-toggles)
   - [Why Action Toggles Use `buttonVariants()` Instead of `BaseButton`](#why-action-toggles-use-buttonvariants-instead-of-basebutton)
   - [Caret Rotation Animation (`ButtonCaret`)](#caret-rotation-animation-buttoncaret)
   - [Required Marker Classes (`dropdown-toggle`, `no-arrow`, `btn-icon`)](#required-marker-classes-dropdown-toggle-no-arrow-btn-icon)
   - [Centralized Icon Sizing in Toggles](#centralized-icon-sizing-in-toggles)
7. [Segmented Controls & View Switchers](#7-segmented-controls-view-switchers)
   - [SegmentedControl vs. BaseButton](#segmentedcontrol-vs-basebutton)
   - [Keyboard & Focus Model (Radix RadioGroup)](#keyboard-focus-model-radix-radiogroup)
   - [Variants: `neutral` vs. `brand`](#variants-neutral-vs-brand)
   - [Flexbox Alignment Safeguard (`self-center`)](#flexbox-alignment-safeguard-self-center)
   - [Shared Styling with Real Tab Panels (`SigninForm`)](#shared-styling-with-real-tab-panels-signinform)
8. [Convenience & Specialized Wrappers](#8-convenience-specialized-wrappers)
   - [`SubmitButton`](#submitbutton)
   - [`CloseDialogButton`](#closedialogbutton)
   - [`CompactEditButton`](#compacteditbutton)
   - [`SaveButton`](#savebutton)
9. [Component Decision Matrix](#9-component-decision-matrix)
10. [Linting Rules & Prohibited Anti-Patterns](#10-linting-rules-prohibited-anti-patterns)
    - [ESLint Rules Matrix](#eslint-rules-matrix)
    - [Converting Legacy Call Sites](#converting-legacy-call-sites)
    - [Good vs. Bad Code Comparison](#good-vs-bad-code-comparison)

---

## 1. Architecture & Design Philosophy

### Unified Button Engine

Waldur HomePort's button architecture is built on top of [Tailwind CSS v4](https://tailwindcss.com), [Radix UI primitives](https://www.radix-ui.com), and the [design tokens](../packages/design-tokens) engine. All legacy Bootstrap and Metronic `.btn` CSS rules have been removed from the application bundle.

Every button in the application is rendered either by:

1. [`BaseButton`](../packages/ui/src/BaseButton.tsx) (`import { BaseButton } from 'waldur-ui'`), or
2. [`buttonVariants()`](../packages/ui/src/BaseButton.tsx) applied to elements that cannot be a `<button>` (e.g. router `<Link>`, custom Radix triggers).

Both share the exact same [`class-variance-authority`](https://cva.style/docs) (`cva`) definition, ensuring identical typography, heights, paddings, state tokens, focus rings, and transitions across the entire codebase.

### Integer Height System

Buttons are implemented with exact, predictable pixel heights across three standardized tiers:

| Size | Height   | Padding (`px` / `py`) | Typography & Line Height          | Corner Radius      | Icon Size                  | Default Context                                        |
| :--- | :------- | :-------------------- | :-------------------------------- | :----------------- | :------------------------- | :----------------------------------------------------- |
| `sm` | **28px** | `px-[8px] py-[4px]`   | `text-sm leading-5` (14px/20px)   | `rounded-md` (6px) | 16px (`size-4` wrapper)    | Table rows, filter bars, inline badges, popovers       |
| `md` | **36px** | `px-[12px] py-[8px]`  | `text-sm leading-5` (14px/20px)   | `rounded-lg` (8px) | 20px (`size-5` wrapper)    | **Default size**. Page actions, card headers, toolbars |
| `lg` | **44px** | `px-[16px] py-[10px]` | `text-base leading-6` (16px/24px) | `rounded-lg` (8px) | 20px (`size-5` wrapper)    | Form submissions, dialog footers, primary hero CTAs    |

> [!NOTE]
> The default size is `md` (36px). `BaseButton` and `buttonVariants()` default to `size="md"` when omitted.

### Inset Box-Shadow Border Mechanics

A standard CSS `border: 1px solid ...` participates in `border-box` layout calculation. Under a 13px root font size and fractional rem cascades, physical borders produced fractional heights (e.g. `43.97px` instead of `44px`), causing subpixel rasterization errors where 1px borders rendered blurry, uneven, or visually thicker depending on scroll position.

To ensure pixel-perfect geometric heights across all operating systems and display densities, `BaseButton` uses an **inset box-shadow border**:

```css
/* Border rendered as an inner shadow */
shadow-[inset_0_0_0_1px_var(--btn-<variant>-border)]
```

- Inset shadows do not expand outer box dimensions.
- Dimensions remain clean integers (`28px`, `36px`, `44px`).
- Variants without visible borders declare `shadow-[inset_0_0_0_1px_transparent]` to maintain identical layout geometry without layout shifting.

### Transitions & Easing

Tailwind's standard `transition-colors` utility animates `color`, `background-color`, and `border-color`, but does **not** animate `box-shadow`. Because the border is drawn via an inset box-shadow, standard transitions caused the border color to snap instantly while the background eased.

`BaseButton` explicitly uses:

```css
transition-[color,background-color,box-shadow]
```

This guarantees that background colors and border outlines ease synchronously across `:hover`, `:focus-visible`, and `:active` states.

### Focus Ring & Forced-Colors Accessibility

Focus rings are rendered using native CSS outlines rather than outer box-shadows:

```css
focus-visible:[outline:2px_solid_var(--btn-<variant>-focus-ring)] focus-visible:[outline-offset:0px]
```

**Why native outline?**

1. **Container resets**: Global reset rules or parent card containers applying `box-shadow: none !important` cannot suppress native outlines.
2. **Forced-Colors / High-Contrast mode**: Windows High Contrast and assistive technologies honor native `outline` properties while often stripping `box-shadow`.
3. **Clean mouse interaction**: `:focus-visible` ensures keyboard navigation displays an authoritative 2px focus indicator, while mouse clicks do not leave persistent rings.
4. **Contrast compliance**: Focus rings for all variants (including `tertiary`) use brand or high-contrast error tokens to achieve a minimum 3:1 contrast ratio against light and dark backgrounds (WCAG 2.1 AA / 1.4.11 Non-text Contrast).

### Active State Press Dynamics

When a user triggers a button via the keyboard (<kbd>Enter</kbd> or <kbd>Space</kbd>), the button matches `:active` and `:focus-visible` simultaneously.

- **`active:shadow-none`**: Clears the inset border shadow during press so it does not bleed through the active background fill.
- **High-contrast text flip on vivid fills**: For `danger`, `warning`, and `success`, the active press state switches from a subtle tint to a vivid, saturated fill (`--btn-*-bg-pressed`). To preserve readability and contrast, the text color flips to crisp white:

  ```css
  active: text-[var(--btn-pressed-text-on-vivid)];
  ```

---

## 2. The 12 Button Variants & Design Tokens

Waldur HomePort defines 12 standard variants across two families:

```typescript
ButtonVariant =
  | 'primary' | 'secondary' | 'tertiary' | 'tertiary-ghost'
  | 'danger' | 'warning' | 'success'
  | 'text-primary' | 'text-secondary' | 'text-danger' | 'text-warning' | 'text-success'
```

### Solid & Bordered Variants

| Variant          | Purpose & Hierarchy                                  | Light Mode Appearance                                                                                                             | Active Press Appearance                         |
| :--------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------- |
| `primary`        | Main call-to-action on a page or dialog              | Solid brand fill (`brand-600`), white text                                                                                        | Darker brand fill (`brand-800`), shadow cleared |
| `secondary`      | Supporting action complementary to primary           | Two-tone: brand tint (`brand-50`), brand border (`brand-300`), plum text (`brand-900`), and vibrant magenta icon (`brand-500`)    | Darker brand tint (`brand-300`), brand text     |
| `tertiary`       | Default neutral button for tables, headers, toolbars | Solid white, subtle gray border (`gray-300`), dark gray text                                                                      | Light gray fill (`gray-100`), shadow cleared    |
| `tertiary-ghost` | Low-emphasis action with no idle border              | Transparent background, tertiary text                                                                                             | Light gray fill (`gray-100`), shadow cleared    |
| `danger`         | Destructive actions (Delete, Terminate, Revoke)      | Error tint (`error-50`), red border & text                                                                                        | Vivid red fill (`error-500`), white text        |
| `warning`        | Cautionary actions requiring warning                 | Warning tint (`warning-50`), amber border & text                                                                                  | Vivid amber fill (`warning-600`), white text    |
| `success`        | Confirmation / affirmative actions (Approve, Accept) | Success tint (`success-50`), green border & text                                                                                  | Vivid green fill (`success-500`), white text    |

### Text Variants

Text variants render with a transparent background and no border in their idle state. They are ideal for inline table actions, breadcrumb links, card headers, and compact secondary actions:

| Variant          | Idle Styling                               | Hover State                                   | Active Press State                                                       |
| :--------------- | :----------------------------------------- | :-------------------------------------------- | :----------------------------------------------------------------------- |
| `text-primary`   | Brand text (`brand-700`), transparent bg   | Brand-tint hover (`brand-50`)                 | In light mode: stays `brand-700`<br>In dark mode: brightens to `gray-50` |
| `text-secondary` | Gray text (`gray-700`), transparent bg     | Subtle gray hover (`gray-100`)                | Transparent bg, gray text                                                |
| `text-danger`    | Red text (`error-700`), transparent bg     | Error-tint hover (`error-50`), red text       | Transparent bg, error text                                               |
| `text-warning`   | Amber text (`warning-600`), transparent bg | Warning-tint hover (`warning-50`), amber text | Transparent bg, warning text                                             |
| `text-success`   | Green text (`success-700`), transparent bg | Success-tint hover (`success-50`), green text | Transparent bg, success text                                             |

### Design Token Architecture & Dark Theme Inversion

All button colors are defined in [`packages/design-tokens/src/buttonColors.css`](../packages/design-tokens/src/buttonColors.css). Zero button styling relies on Metronic SCSS or runtime Bootstrap mixins.

1. **Brand-Reactive vs. Fixed Ramps**:
   - `primary`, `secondary`, and `text-primary` derive directly from the runtime `--waldur-brand-*` palette (customizable per tenant/deployment).
   - `danger`, `warning`, and `success` derive from static error/warning/success ramps.
   - `tertiary` combines a neutral gray surface with a `--waldur-brand-600` focus ring to ensure WCAG 2.1 compliance on white surfaces.
2. **Dark Mode Mechanics (`:root[data-theme='dark']`)**:
   - In dark mode, buttons automatically map to inverted dark surfaces (`--color-gray-dark-*` and dark brand ramps).
   - Solid buttons (`tertiary`, `secondary`) adopt deep dark surface colors (`gray-dark-950`, `brand-900`) with high-contrast text (`gray-dark-300`, `gray-dark-50`).
   - Disabled states shift to `var(--color-gray-dark-800)` background with `var(--color-gray-dark-500)` text.

### Complete Token Mapping Reference

```css
/* Core button token definitions from buttonColors.css */
:root {
  --btn-primary-bg: var(--waldur-brand-600);
  --btn-primary-bg-hover: var(--waldur-brand-700);
  --btn-primary-bg-pressed: var(--waldur-brand-800);
  --btn-primary-text: #ffffff;
  --btn-primary-focus-ring: var(--waldur-brand-600);

  --btn-secondary-bg: var(--waldur-brand-50);
  --btn-secondary-bg-hover: var(--waldur-brand-200);
  --btn-secondary-bg-pressed: var(--waldur-brand-300);
  --btn-secondary-border: var(--waldur-brand-300);
  --btn-secondary-text: var(--waldur-brand-900);
  --btn-secondary-icon: var(--waldur-brand-500);
  --btn-secondary-focus-ring: var(--waldur-brand-600);

  --btn-tertiary-bg: #ffffff;
  --btn-tertiary-bg-hover: var(--color-gray-50);
  --btn-tertiary-bg-pressed: var(--color-gray-100);
  --btn-tertiary-border: var(--color-gray-300);
  --btn-tertiary-text: var(--color-gray-700);
  --btn-tertiary-focus-ring: var(--waldur-brand-600);

  --btn-disabled-bg: var(--color-gray-100);
  --btn-disabled-text: var(--color-gray-400);
  --btn-pressed-text-on-vivid: #ffffff;
}

:root[data-theme='dark'] {
  --btn-primary-focus-ring: var(--waldur-brand-500);

  --btn-secondary-bg: var(--waldur-brand-900);
  --btn-secondary-bg-hover: var(--waldur-brand-700);
  --btn-secondary-bg-pressed: var(--waldur-brand-600);
  --btn-secondary-border: var(--waldur-brand-400);
  --btn-secondary-text: var(--color-gray-dark-50);
  --btn-secondary-icon: var(--waldur-brand-400);
  --btn-secondary-focus-ring: var(--waldur-brand-500);

  --btn-tertiary-bg: var(--color-gray-dark-950);
  --btn-tertiary-bg-hover: var(--color-gray-dark-900);
  --btn-tertiary-bg-pressed: var(--color-gray-dark-700);
  --btn-tertiary-border: var(--color-gray-dark-700);
  --btn-tertiary-text: var(--color-gray-dark-300);
  --btn-tertiary-focus-ring: var(--waldur-brand-500);

  --btn-disabled-bg: var(--color-gray-dark-800);
  --btn-disabled-text: var(--color-gray-dark-500);
  --btn-pressed-text-on-vivid: var(--color-gray-dark-50);
}
```

---

## 3. Tooltips, Disabled States & Direct DOM Integration

### Why `data-disabled` and Direct Tooltips Replace Wrapper Spans

In legacy implementations, Tailwind/shadcn applied `disabled:pointer-events-none` to disabled buttons. However, `pointer-events: none` prevents the browser from firing `mouseenter` and `pointerover` events on `<button disabled>`. To make tooltips work on disabled buttons, libraries commonly introduced a workaround: wrapping the button in an extra `<span className="inline-block">`.

**The wrapper `<span>` created severe architectural problems:**

1. **Broken Flexbox Layouts**: Placing an intermediate `<span>` around the `<button>` intercepts flex parent rules. Classes like `align-self-center`, `self-end`, `w-100`, or `flex-1` applied to the button failed to affect the wrapper, requiring fragile class mirroring hacks.
2. **DOM Identity & Mount Churn**: When a button toggled between enabled (no tooltip) and disabled (with tooltip), React saw different JSX trees (`<button>` vs `<Tooltip><span><button></span></Tooltip>`). React destroyed the old DOM node and mounted a brand new button, losing keyboard focus and breaking test handles.

**The Modern Waldur Solution:**

1. **Removed `disabled:pointer-events-none`** from `buttonVariants()`.
2. **Added `disabled:cursor-not-allowed data-disabled:cursor-not-allowed`** to the base variants.
3. **Added matching `data-disabled:*` styles** across all 12 variants.
4. **Direct `<Tooltip>` wrapping**: `<BaseButton>` renders `<button>` directly inside `<Tooltip>` with **zero wrapper spans**:

```tsx
// Inside BaseButton.tsx
const button = (
  <button
    ref={ref}
    disabled={isDisabled}
    data-disabled={isDisabled ? '' : undefined}
    className={cn(buttonVariants({ variant, size, iconOnly }), className)}
    {...rest}
  >
    {/* content */}
  </button>
);

return (
  <Tooltip
    label={effectiveTooltip}
    side={tooltipSide}
    alwaysMount={!!tooltip || !!disabledReason}
  >
    {button}
  </Tooltip>
);
```

Because `pointer-events` remain enabled on `<button disabled>`, the native `<button>` receives hover events directly. Radix Tooltip fires effortlessly while the cursor correctly shows `not-allowed`.

### The `alwaysMount` Lifecycle Guarantee

`Tooltip` provides an `alwaysMount` prop (`packages/ui/src/Tooltip.tsx`). When a button specifies `tooltip` or `disabledReason`, `BaseButton` sets `alwaysMount={true}` on the `Tooltip`.

- Even when the button is currently enabled and `effectiveTooltip` is `undefined`, `alwaysMount` ensures the Radix `Tooltip.Root` and `Tooltip.Trigger` remain mounted in the DOM tree.
- When the button transitions to disabled (triggering `disabledReason`), the JSX tree structure remains 100% identical.
- **The button is never unmounted or remounted.** Keyboard focus and DOM refs remain rock-solid across state transitions.

### Explaining Unavailable Actions (`disabledReason` vs `tooltip`)

| Prop             | Visibility                                     | Typical Use Case                                                                               |
| :--------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `disabledReason` | **Only visible when button is disabled**       | Explaining why an action is blocked (e.g., missing permissions, quota exceeded, invalid state) |
| `tooltip`        | **Always visible** (both enabled and disabled) | Describing what the button does (standard for icon-only buttons)                               |

```tsx
// ✅ Explaining why an action is disabled
<BaseButton
  label={translate('Terminate resource')}
  variant="danger"
  disabled={!canTerminate}
  disabledReason={translate('Only project administrators can terminate active resources')}
  onClick={handleTerminate}
/>

// ✅ Icon-only button with permanent tooltip describing the action
<BaseButton
  iconNode={<TrashIcon weight="bold" />}
  variant="danger"
  size="sm"
  tooltip={translate('Delete item')}
  onClick={handleDelete}
/>
```

### Lint Enforcement: `enforce-disabled-button-tooltip`

To guarantee outstanding UX, the custom ESLint rule [`waldur-custom/enforce-disabled-button-tooltip`](../packages/eslint-plugin-waldur/rules/enforce-disabled-button-tooltip.js) runs as an **error** across the repository.

Any `<BaseButton disabled={...}>` without a corresponding `disabledReason` or `tooltip` prop will fail CI linting:

```tsx
// ❌ FAILS LINT: User does not know why button is disabled
<BaseButton disabled={!canEdit} label={translate('Edit')} />

// ✅ PASSES LINT: Reason clearly provided
<BaseButton
  disabled={!canEdit}
  disabledReason={translate('You need edit permission')}
  label={translate('Edit')}
/>
```

---

## 4. Icons, Typography & Loading States

### Phosphor Icon Integration

Waldur HomePort uses `@phosphor-icons/react` with `weight="bold"` for button icons:

```tsx
import { PlusCircleIcon, TrashIcon, ArrowRightIcon } from '@phosphor-icons/react';

// Leading icon (default)
<BaseButton
  label={translate('Create project')}
  iconNode={<PlusCircleIcon weight="bold" />}
  variant="primary"
  size="lg"
/>

// Trailing icon
<BaseButton
  label={translate('Continue')}
  iconNode={<ArrowRightIcon weight="bold" />}
  iconRight
  variant="primary"
/>
```

### Exact SVG Sizing via Standard Tailwind Classes

Phosphor icons render with `width="1em" height="1em"` by default. In a standard `<button>`, `1em` resolves against the button's font-size (14px on `sm`/`md`, 16px on `lg`), causing icons to look smaller than intended.

`BaseButton` wraps `iconNode` in a dedicated container styled with standard Tailwind utility classes:

```tsx
// SVG sizing wrapper in BaseButton
<span
  className={cn(
    'inline-flex shrink-0 items-center justify-center text-[var(--btn-icon-color,currentColor)]',
    size === 'sm' ? 'size-4 [&>svg]:size-4' : 'size-5 [&>svg]:size-5',
  )}
>
  {iconNode}
</span>
```

**Why this architecture?**

- Standard Tailwind classes: `size-4 [&>svg]:size-4` (16px) on `sm`, and `size-5 [&>svg]:size-5` (20px) on `md`/`lg`.
- The child `[&>svg]:size-*` selector forces Phosphor icons past their intrinsic `1em` font-size sizing directly via static Tailwind utilities.
- Clean DOM without inline `--icon-size` styles or custom CSS variable overhead.

### Icon-Only Square Buttons

When `label` is omitted and `iconNode` is supplied, `BaseButton` automatically activates `iconOnly: true`:

- Padding is reset to `p-0`.
- Dimensions are pinned to exact squares: `28px × 28px` (`sm`), `36px × 36px` (`md`), and `44px × 44px` (`lg`).
- `aria-label` is automatically populated from `tooltip` or `disabledReason` if available.

```tsx
// 28px square icon-only button
<BaseButton
  iconNode={<PencilSimpleIcon weight="bold" />}
  variant="tertiary"
  size="sm"
  tooltip={translate('Edit')}
  onClick={onEdit}
/>
```

### Loading Spinner Mechanics (`pending`)

When `pending={true}`:

1. The button is automatically disabled (`isDisabled = disabled || pending`).
2. The regular icon is swapped for [LoadingSpinner](../packages/ui/src/LoadingSpinner.tsx).
3. The spinner applies `-me-[3.25px]` when a label is present to counteract the `gap-2` flex spacing, keeping the spinner positioned at the exact visual offset expected alongside the text.
4. Button width remains visually balanced without layout jumps.

```tsx
<BaseButton
  label={translate('Deploying...')}
  pending={isDeploying}
  variant="primary"
  size="lg"
/>
```

### Prohibition of `.svg-icon` Wrappers

> [!CAUTION]
> **Never wrap button icons in `.svg-icon`**.
> Legacy Metronic stylesheets define `.svg-icon { fill: #A1A5B7 !important; }`. This rule beats `currentColor` and turns crisp white icons on primary buttons into a muddy gray. Always pass bare Phosphor icons directly to `iconNode`.

---

## 5. Links Rendered as Buttons

When a user action triggers router navigation (changing the URL or transitioning states) rather than invoking a mutation or callback, it must be rendered as an `<a>` element for accessibility and standard browser behaviors (middle click, open in new tab).

The application provides [`src/core/Link.tsx`](../src/core/Link.tsx), which accepts button styling props and applies `buttonVariants()` to the underlying anchor:

```tsx
import { Link } from '@/core/Link';

<Link
  state="marketplace-offering-details"
  params={{ uuid: offering.uuid }}
  buttonVariant="primary"
  buttonSize="md"
>
  {translate('View details')}
</Link>;
```

### Supported Link Props

- `buttonVariant`: Any `ButtonVariant` (`'primary'`, `'secondary'`, `'tertiary'`, etc.).
- `buttonSize`: Any `ButtonSize` (`'sm'`, `'md'`, `'lg'`). Defaults to `'md'`.
- `buttonIconOnly`: Boolean for square icon-only anchors.

### Text-Anchor Suppression

When `buttonVariant` is omitted, `Link` applies the default `.text-anchor` class (brand-colored underline text link). When `buttonVariant` is present, `Link` automatically suppresses `.text-anchor`, allowing `buttonVariants()` to control all colors.

### Specialized Entity Link Wrappers

All domain link wrappers forward `buttonVariant`, `buttonSize`, and `buttonIconOnly`:

```tsx
import { OrganizationLink } from '@/customer/OrganizationLink';
import { ProjectLink } from '@/project/ProjectLink';

<OrganizationLink
  customer={customer}
  buttonVariant="tertiary"
  buttonSize="sm"
/>;
```

### Prohibited Link Button Patterns

```tsx
// ❌ PROHIBITED: Hand-written legacy btn classes on Link
<Link state="project.details" className="btn btn-primary btn-sm">
  {translate('View')}
</Link>

// ❌ PROHIBITED: Native anchor with btn classes
<a href="/login" className="btn btn-secondary">
  {translate('Log in')}
</a>

// ✅ CORRECT: First-class buttonVariant prop
<Link state="project.details" buttonVariant="primary" buttonSize="sm">
  {translate('View')}
</Link>
```

---

## 6. Dropdown & Menu Toggles

Action dropdown toggles—such as [`TableDropdownToggle`](../src/table/ActionsDropdown.tsx), `AddDropdownToggle`, and `ActionDropdownButton.Toggle`—render dropdown triggers inside tables, card headers, and toolbars.

### Why Action Toggles Use `buttonVariants()` Instead of `BaseButton`

Action toggles render a direct `<button>` element styled with `buttonVariants({ variant, size })` rather than wrapping in `BaseButton`:

```tsx
// TableDropdownToggle renders raw button with buttonVariants()
<button
  ref={ref}
  type="button"
  className={cn(
    buttonVariants({ variant, size }),
    'dropdown-toggle no-arrow',
    className,
  )}
  disabled={disabled}
  data-disabled={disabled ? '' : undefined}
  {...rest}
>
  {label || translate('Actions')}
  <ButtonCaret size={size} />
</button>
```

**Rationale:**

1. **Direct Child Selector for Caret Animation**: The rotating caret animation is governed by:

   ```css
   .dropdown-toggle[data-state='open'] > .rotate-toggle-180 {
     transform: rotate(180deg);
   }
   ```

   `BaseButton` wraps its `iconNode` inside an intermediate `<span>` wrapper. That extra wrapper prevents the `> .rotate-toggle-180` child combinator from matching. Rendering a raw `<button>` with `buttonVariants({ variant, size })` and `<ButtonCaret size={size} />` ensures the caret remains a direct child.

2. **Clean Radix Trigger Composition**: `RadixDropdownMenu.Trigger asChild` clones its immediate child, attaching ref and handlers. Rendering `<button>` directly ensures zero intermediate DOM layers.

### Caret Rotation Animation (`ButtonCaret`)

When a Radix dropdown opens, it injects `data-state="open"` onto the trigger button. `<ButtonCaret size={size} />` includes the `.rotate-toggle-180` class, which smoothly rotates the icon 180 degrees using CSS transitions.

### Required Marker Classes (`dropdown-toggle`, `no-arrow`, `btn-icon`)

Toggles retain three specific utility classes:

- **`dropdown-toggle`**: Required for CSS caret rotation and for read-only view hiding rules (`table .dropdown-toggle { display: none !important }`).
- **`no-arrow`**: Suppresses Bootstrap's legacy CSS `::after` caret pseudo-element, since toggles render an explicit Phosphor `CaretDownIcon`.
- **`btn-icon`**: An inert marker used by read-only view stylesheets to hide icon-only toggles in panels and cards (`.dropdown-toggle.btn-icon { display: none }`).

### Centralized Icon Sizing in Toggles

Toggle buttons and standalone icons use the centralized sizing helper `getButtonIconSize(size)` and the `<ButtonCaret size={size} />` component from `waldur-ui`:

- `16px` (`BUTTON_ICON_SIZES.sm`) for `size="sm"`
- `20px` (`BUTTON_ICON_SIZES.lg`) for `size="md"` / `size="lg"`
  This preserves exact alignment with standard `BaseButton` icons while inheriting the button's `currentColor`.

---

## 7. Segmented Controls & View Switchers

When an interface presents mutually exclusive options that change what a view **shows** (filtering a table, toggling between card/list mode, switching chart date ranges) rather than navigating to a different page, use [SegmentedControl](../packages/ui/src/SegmentedControl.tsx) (`packages/ui/src/SegmentedControl.tsx`).

### SegmentedControl vs. BaseButton

```tsx
import { SegmentedControl } from 'waldur-ui';

<SegmentedControl
  value={viewMode}
  onValueChange={setViewMode}
  size="sm"
  variant="neutral"
  options={[
    { value: 'table', label: <TableIcon weight="bold" /> },
    { value: 'grid', label: <SquaresFourIcon weight="bold" /> },
  ]}
/>;
```

- **Do NOT** use a row of separate `BaseButton` components for view switching.
- **Do NOT** use legacy `react-bootstrap` `ToggleButtonGroup` or `.btn-group` classes.

### Keyboard & Focus Model (Radix RadioGroup)

`SegmentedControl` is built on `@radix-ui/react-radio-group`:

- Items have `role="radio"`, and the container has `role="radiogroup"`.
- **Single Tab Stop**: <kbd>Tab</kbd> enters the group directly at the currently selected option and leaves in one step.
- **Arrow Navigation**: Arrow keys (<kbd>←</kbd> / <kbd>→</kbd>) move focus **and automatically select** the target option.
- Numeric options round-trip cleanly through Radix strings back to their typed numbers.

### Variants: `neutral` vs. `brand`

| Variant             | Idle Segments                     | Selected Segment                                        | Typical Context                                                  |
| :------------------ | :-------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------- |
| `neutral` (default) | Solid white (`--btn-tertiary-bg`) | Tertiary pressed gray (`--btn-tertiary-bg-pressed`)     | Secondary view switchers in toolbars and table headers           |
| `brand`             | Light brand tint                  | Primary brand fill (`--btn-primary-bg`) with white text | Primary page-level switchers (e.g. reporting period, chart mode) |

### Flexbox Alignment Safeguard (`self-center`)

In [`segmentedStyles.ts`](../packages/ui/src/segmentedStyles.ts), the control list declares:

```css
inline-flex self-center
```

Under flexbox's default `align-items: stretch`, a control placed in a flex row alongside taller siblings (e.g. an input or search field) would stretch vertically, corrupting its intended button height. `self-center` guarantees the control strictly retains its 28px/36px/44px height regardless of surrounding elements.

### Shared Styling with Real Tab Panels (`SigninForm`)

When options own full tab panels, use Radix `Tabs` rather than `SegmentedControl`. However, import `segmentedListClassName` and `segmentedItemClassName` from `waldur-ui` to style the `Tabs.List` and `Tabs.Trigger` elements so they visually match `SegmentedControl` identically.

---

## 8. Convenience & Specialized Wrappers

Waldur provides specialized button wrappers for standard application patterns. All of them internally render `BaseButton`:

### `SubmitButton`

Location: [`src/form/SubmitButton.tsx`](../src/form/SubmitButton.tsx)

Used for submitting forms.

- **Defaults to large size (`size="lg"`, 44px)**. Pass `size="sm"` for compact popovers or inline forms.
- **Pending state (`submitting`)**: Shows `<LoadingSpinner />` and disables the button.
- **Form invalidation (`invalid`)**: Disables the button when form validation fails.
- **`iconNode` & `iconOnLeft`**: Defaults to trailing icon; pass `iconOnLeft={true}` for leading icons.
- **Associating with external forms**: Supports `form="form-id"` for submission buttons rendered in dialog footers outside the `<form>` DOM tree.

```tsx
import { SubmitButton } from '@/form';

<SubmitButton
  submitting={submitting}
  disabled={invalid || !dirty}
  label={translate('Save changes')}
/>;
```

### `CloseDialogButton`

Location: [`src/modal/CloseDialogButton.tsx`](../src/modal/CloseDialogButton.tsx)

Used as the standard dismiss/cancel button in modal dialog footers.

- **Defaults to `variant="tertiary"` and `size="lg"` (44px)**.
- Automatically connects to `useModal().closeDialog()`.
- Default label is `translate('Cancel')`.

```tsx
import { CloseDialogButton } from '@/modal/CloseDialogButton';

// Standard dialog footer
<ModalFooter>
  <CloseDialogButton />
  <SubmitButton submitting={submitting} label={translate('Create')} />
</ModalFooter>;
```

### `CompactEditButton`

Location: [`src/form/CompactEditButton.tsx`](../src/form/CompactEditButton.tsx)

Used for inline editing in key-value tables and settings rows.

- **Fixed `size="sm"` (28px)**.
- Renders `PencilSimpleIcon` with `variant="tertiary"`.
- Prevents layout bloat in tight table cells.

```tsx
import { CompactEditButton } from '@/form/CompactEditButton';

<CompactEditButton onClick={() => setEditing(true)} />;
```

### `SaveButton`

Location: [`src/core/SaveButton.tsx`](../src/core/SaveButton.tsx)

Used in forms that track dirty/unsaved state.

- Automatically switches to `variant="warning"` and shows an unsaved notification badge when `dirty={true}`.
- Wraps in a tooltip explaining unsaved changes.

---

## 9. Component Decision Matrix

| Scenario / Use Case              | Component           | Variant                        | Size                       | Notes                                    |
| :------------------------------- | :------------------ | :----------------------------- | :------------------------- | :--------------------------------------- |
| **Primary Page Action**          | `BaseButton`        | `primary`                      | `md` (36px) or `lg` (44px) | Top-right page header actions            |
| **Modal Submission**             | `SubmitButton`      | `primary`                      | `lg` (44px)                | Rightmost button in modal footer         |
| **Modal Cancel / Dismiss**       | `CloseDialogButton` | `tertiary`                     | `lg` (44px)                | Leftmost button in modal footer          |
| **Destructive Action**           | `BaseButton`        | `danger`                       | Contextual                 | Use `disabledReason` if deletion blocked |
| **Table Row Action (Text)**      | `BaseButton`        | `tertiary` or `text-secondary` | `sm` (28px)                | Fits within 36px table row height        |
| **Table Row Action (Icon)**      | `BaseButton`        | `tertiary` or `text-secondary` | `sm` (28px)                | Provide `tooltip`                        |
| **Table Actions Dropdown**       | `ActionsDropdown`   | `tertiary`                     | `lg` (44px)                | Uses `TableDropdownToggle` trigger       |
| **Table Toolbar Filter/Refresh** | `BaseButton`        | `tertiary`                     | `lg` (44px)                | Standard table control height            |
| **Inline Form / Popover Submit** | `SubmitButton`      | `primary`                      | `sm` (28px)                | Compact form contexts                    |
| **Key-Value Row Edit**           | `CompactEditButton` | `tertiary`                     | `sm` (28px)                | Inline field editing                     |
| **Page / State Navigation**      | `Link`              | `buttonVariant="primary"`      | `md` (36px)                | Keeps routing anchor semantics           |
| **View / Mode Switcher**         | `SegmentedControl`  | `neutral` or `brand`           | `sm` (28px) or `md` (36px) | Mutually exclusive view options          |

---

## 10. Linting Rules & Prohibited Anti-Patterns

### ESLint Rules Matrix

| ESLint Rule                                     | Severity | What It Enforces                                                                                                                                                          |
| :---------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-restricted-imports`                         | `error`  | Blocks importing `Button` or `DropdownButton` from `react-bootstrap`. Directs developers to `BaseButton`, `SubmitButton`, `CloseDialogButton`, or `ActionDropdownButton`. |
| `waldur-custom/no-bootstrap-button-markup`      | `error`  | Blocks `<button className="btn ...">`, `<a className="btn ...">`, and any hand-rolled Bootstrap button markup.                                                            |
| `waldur-custom/enforce-disabled-button-tooltip` | `error`  | Enforces that every disabled `<BaseButton>` has a `tooltip` or `disabledReason` explaining why the action is unavailable.                                                 |
| `waldur-custom/enforce-dialog-button-order`     | `error`  | Enforces standard dialog button order: dismissive buttons (`CloseDialogButton`) on the left, affirmative/submission buttons (`SubmitButton`) on the right.                |
| `waldur-custom/no-edit-button-size-override`    | `error`  | Blocks overriding `size="sm"` on `EditButton`; requires using `CompactEditButton` instead.                                                                                |

### Converting Legacy Call Sites

| From                                                                | To                                                                                                                                                                      |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-bootstrap` `Button`, `<button className="btn btn-x btn-sm">` | `<BaseButton variant="…" size="sm" label={…} />`                                                                                                                        |
| `<a className="btn …">` / `Link` with `btn` classes                 | `<Link buttonVariant="…" buttonSize="…">`                                                                                                                               |
| `ToggleButtonGroup`, `btn-group` + `btn-check`                      | `SegmentedControl`                                                                                                                                                      |
| `ButtonGroup` of unrelated actions                                  | `<div className="d-flex gap-2">` of `BaseButton`s                                                                                                                       |
| Radix `Trigger asChild` around a button                             | `BaseButton` directly (it is `forwardRef`); use a raw element + `buttonVariants()` only when the trigger's child must have a specific DOM shape (see `ActionsDropdown`) |
| HTML built as a string (chart tooltips)                             | `class="${buttonVariants({ variant, size })}"`                                                                                                                          |
| `disabled` with no explanation                                      | Add `disabledReason`                                                                                                                                                    |
| `.svg-icon` / font icon inside the button                           | `iconNode={<PhosphorIcon weight="bold" />}`                                                                                                                             |

**Rules of thumb when converting:**

1. **Do not carry `btn-*` classes across**: Legacy Bootstrap/Metronic CSS rules were compound with `.btn` (`.btn.btn-sm`, `.btn.btn-icon`), so carrying `btn-sm`, `btn-icon`, `btn-active-icon-danger` or similar on an element without the literal `.btn` class never matched anything. Pick first-class `variant` and `size` props instead.
2. **Verify replacement in place**: Old rules often had container-level minimum heights or widths that stopped applying when converted to `BaseButton`. If a converted button looks smaller than before, set `size` explicitly (`sm`, `md`, `lg`).

### Good vs. Bad Code Comparison

#### 1. Button Imports & Wrappers

```tsx
// ❌ BAD: Legacy react-bootstrap button
import { Button } from 'react-bootstrap';
<Button variant="primary">Submit</Button>

// ❌ BAD: Hand-written Bootstrap classes
<button className="btn btn-primary btn-sm">Submit</button>

// ✅ GOOD: Standard BaseButton
import { BaseButton } from 'waldur-ui';
<BaseButton variant="primary" size="md" label={translate('Submit')} />
```

#### 2. Disabled State Explanations

```tsx
// ❌ BAD: Silent disabled state (fails ESLint)
<BaseButton disabled={!canEdit} label={translate('Edit')} />

// ✅ GOOD: Explanation provided via disabledReason
<BaseButton
  disabled={!canEdit}
  disabledReason={translate('You do not have permission to edit this item')}
  label={translate('Edit')}
/>
```

#### 3. Icons in Buttons

```tsx
// ❌ BAD: Metronic svg-icon wrapper (ruins icon color contrast)
<BaseButton
  label={translate('Delete')}
  iconNode={<span className="svg-icon"><TrashIcon /></span>}
/>

// ✅ GOOD: Bare Phosphor icon passed directly
<BaseButton
  label={translate('Delete')}
  iconNode={<TrashIcon weight="bold" />}
/>
```

#### 4. Links as Buttons

```tsx
// ❌ BAD: Anchor with legacy btn class
<Link state="project.create" className="btn btn-primary">
  {translate('Create')}
</Link>

// ✅ GOOD: First-class buttonVariant prop
<Link state="project.create" buttonVariant="primary" buttonSize="md">
  {translate('Create')}
</Link>
```

#### 5. Mutually Exclusive Switchers

```tsx
// ❌ BAD: Row of separate BaseButtons as tabs/switchers
<div className="d-flex">
  <BaseButton variant={active === 'day' ? 'primary' : 'tertiary'} label="Day" />
  <BaseButton variant={active === 'week' ? 'primary' : 'tertiary'} label="Week" />
</div>

// ✅ GOOD: Accessible SegmentedControl with arrow-key navigation
<SegmentedControl
  value={period}
  onValueChange={setPeriod}
  options={[
    { value: 'day', label: translate('Day') },
    { value: 'week', label: translate('Week') },
  ]}
/>
```
