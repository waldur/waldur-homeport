# Sidebar Navigation Guide

The Sidebar navigation suite in `packages/ui/src/Sidebar/` provides a comprehensive, multi-tiered sidebar navigation system for Waldur HomePort. Built on top of Radix UI primitives and styled with Tailwind CSS and design tokens, it provides responsive drawer behavior, collapsed icon rails with non-reflowing hover expansion, nested accordions with dynamic height measurement, and domain-specific workspace convenience components.

---

## Architecture Overview

The Sidebar component system is structured into three distinct layers:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 3: Convenience & Domain Components                                │
│ (SidebarBrand, SidebarModeCard, SidebarNavItem, SidebarMenuLinkItem,    │
│  SidebarCallToAction, SidebarSection, SidebarToggleGraphic)             │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Hierarchical Menu & Accordion Engine                           │
│ (SidebarMenuButton, SidebarMenuBadge, SidebarMenuSub,                   │
│  SidebarMenuAccordion, SidebarMenuTree, useExclusiveOpen)               │
├─────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Core Shell & Layout Primitives                                 │
│ (SidebarProvider, useSidebar, Sidebar, SidebarTrigger, SidebarInset,    │
│  SidebarHeader, SidebarContent [Radix ScrollArea], SidebarFooter,       │
│  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem)         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module File Map

All Sidebar components are co-located in `packages/ui/src/Sidebar/`:

| Module                     | Responsibility                                      | Key Exports                                                                                                              |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `context.tsx`              | Context definitions and hooks                       | `useSidebar`, `useSidebarSubDepth`, `SidebarContextProps`                                                                |
| `SidebarProvider.tsx`      | State owner, media query, and CSS variables         | `SidebarProvider`, `SidebarProviderProps`                                                                                |
| `SidebarRoot.tsx`          | Shell wrapper, desktop rail, mobile drawer, trigger | `Sidebar`, `SidebarTrigger`, `SidebarInset`                                                                              |
| `SidebarLayout.tsx`        | Structural layout slots and Radix ScrollArea        | `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarSeparator` |
| `SidebarMenuButton.tsx`    | Interactive button primitive, tooltips, badge       | `SidebarMenuButton`, `SidebarMenuBadge`, `sidebarMenuButtonVariants`                                                     |
| `SidebarMenuSub.tsx`       | Nested accordions and height-measured Collapsible   | `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarMenuAccordion`, `SidebarMenuSeparator`           |
| `SidebarMenuTree.tsx`      | Recursive tree rendering, overflow pagination       | `SidebarMenuTree`, `useExclusiveOpen`, `SidebarMenuTreeItem`                                                             |
| `SidebarConvenience.tsx`   | Dashboard mockup convenience wrappers               | `SidebarBrand`, `SidebarModeCard`, `SidebarNavItem`, `SidebarMenuLinkItem`, `SidebarCallToAction`, `SidebarSection`      |
| `SidebarToggleGraphic.tsx` | Canonical SVG glyph for collapse button             | `SidebarToggleGraphic`                                                                                                   |
| `index.ts`                 | Public export surface                               | All above exports re-exported cleanly                                                                                    |

---

## State Management & Hooks

### `useSidebar()`

The primary hook consumed by sidebar components and page shells to inspect and control the sidebar state. Must be rendered within a `<SidebarProvider>`.

```typescript
const {
  state, // 'expanded' | 'collapsed'
  open, // boolean (desktop open state)
  setOpen, // (open: boolean) => void
  isMobile, // boolean (true when viewport < mobileBreakpoint)
  openMobile, // boolean (mobile Sheet open state)
  setOpenMobile, // (open: boolean) => void
  toggleSidebar, // () => void (toggles desktop open or mobile drawer)
  isHoverExpanded, // boolean (true when collapsed rail is hovered)
  setIsHoverExpanded, // (expanded: boolean) => void
} = useSidebar();
```

### `useSidebarSubDepth()`

Hierarchical navigation tracks nesting depth through `SidebarMenuSubDepthContext`. Top-level menu items have a depth of `0`. Each `<SidebarMenuSub>` automatically increments this depth:

- `depth = 0`: Top-level items (no indentation, 6px border-radius).
- `depth = 1`: First nested submenu level (indented, square corners, subitem active background).
- `depth = 2+`: Deeper nested submenus (incremented indentation, second-level subitem background).

```typescript
import { useSidebarSubDepth } from 'waldur-ui';

function CustomMenuRow() {
  const depth = useSidebarSubDepth();
  const extraIndent = depth > 0 ? Math.max(depth - 1, 0) * 9.75 : 0;
  return <div style={{ paddingLeft: 12 + extraIndent }}>...</div>;
}
```

### `useExclusiveOpen(initial?: string)`

A state hook for managing mutually exclusive accordions among sibling items (e.g., ensuring opening one accordion automatically closes all others at the same level):

```typescript
const { openId, setOpenId, toggle } = useExclusiveOpen('projects');

<SidebarMenuAccordion
  title="Projects"
  open={openId === 'projects'}
  onOpenChange={toggle('projects')}
>
  ...
</SidebarMenuAccordion>
<SidebarMenuAccordion
  title="Organizations"
  open={openId === 'organizations'}
  onOpenChange={toggle('organizations')}
>
  ...
</SidebarMenuAccordion>
```

---

## Responsive Behavior & Layout Modes

### 1. Desktop Expanded vs. Collapsed Rail

On viewports above `mobileBreakpoint` (default `768px`):

- **Expanded Width**: `--sidebar-width` (`300px`). Full logo, section labels, badges, item labels, and carets are displayed.
- **Collapsed Rail Width**: `--sidebar-width-icon` (`3rem` / `48px`). Labels and badges hide; menu items shrink to centered icon buttons (`size-9` / 36px); `SidebarModeCard` collapses to an icon tile; `SidebarBrand` displays the compact mobile logo mark (swapping from the full wordmark), with the collapse toggle revealed on hover.

### 2. Desktop Hover Expansion (No Page Reflow)

When the desktop sidebar is collapsed in `'icon'` mode, hovering the mouse over the rail temporarily expands the panel back to `300px` without pushing or reflowing adjacent page content:

```text
Collapsed State:
[Rail 48px][Main Content ──────────────────────────────────]

Hovered State:
[Expanded Panel 300px overlay]
[Spacer 48px][Main Content ────────────────────────────────]
(Spacer width stays 48px — main page content does NOT reflow)
```

**Technical Implementation**:

1. An invisible **Layout Spacer** (`<div>`) sits in the flex layout alongside `SidebarInset`. Its width is strictly tied to the canonical `state` (`'expanded'` or `'collapsed'`).
2. The visible **Panel Overlay** (`<div className="group/panel fixed inset-y-0 z-sidebar-panel">`) sits at `z-index: 105`.
3. Hovering the panel triggers `onMouseEnter`, setting `isHoverExpanded = true`. The fixed panel widens to `300px` and adds a subtle drop shadow (`md:shadow-[5px_0px_10px_rgba(70,78,95,0.075)]`), floating gracefully over the main layout without causing layout thrashing.
4. Item label tooltips are automatically suppressed while `isHoverExpanded` is true, since the real text label is already visible.

### 3. Mobile Sheet Drawer

When the viewport width is below `mobileBreakpoint`:

- The desktop rail and spacer are hidden (`hidden md:block`).
- The sidebar renders inside a Radix `Sheet` modal drawer anchored to the configured `side` (`left` or `right`).
- Drawer width is pinned to `250px`.
- Backdrop overlay dims the rest of the application.
- `openMobile` and `setOpenMobile` control visibility. Calling `toggleSidebar()` automatically switches between toggling mobile drawer vs. desktop collapse.

### 4. Collapsible Modes

`<Sidebar collapsible="...">` supports three modes:

| Mode          | Behavior                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| `'icon'`      | Collapses to a 3rem (48px) icon-only rail with hover-expansion. _(Default)_ |
| `'offcanvas'` | Slides completely offscreen when collapsed.                                 |
| `'none'`      | Static fixed sidebar that cannot be collapsed.                              |

---

## Theming & Design Tokens

Sidebar styling is entirely powered by CSS custom properties defined in `@waldur/design-tokens/src/sidebarColors.css`.

### Token Reference

| Token                         | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `--surface-sidebar-bg`        | Background color of the sidebar panel             |
| `--surface-sidebar-border`    | Border color between the sidebar and main content |
| `--nav-item-text`             | Color of navigation item labels and text          |
| `--nav-item-icon`             | Color of navigation item icons and caret glyphs   |
| `--nav-item-hover-bg`         | Background color on row hover                     |
| `--nav-item-active-bg`        | Background color for active navigation rows       |
| `--nav-accordion-active`      | Ambient background of an open top-level accordion |
| `--nav-sub-accordion-active`  | Ambient background of an open nested accordion    |
| `--nav-item-subitem-bg`       | Active background color for level-1 nested items  |
| `--nav-item-subitem2-bg`      | Active background color for level-2+ nested items |
| `--nav-badge-text`            | Text color for item count badges                  |
| `--nav-badge-border`          | Border color for item count badges                |
| `--nav-separator`             | Color of horizontal dividing lines                |
| `--nav-scrollbar-color`       | Scrollbar thumb color in `SidebarContent`         |
| `--nav-scrollbar-hover-color` | Scrollbar thumb hover color                       |

### Sidebar Style Variants

Waldur supports 5 distinct sidebar color styles via the `data-sidebar-style` attribute:

```html
<!-- Light Sidebar (default in light theme) -->
<div data-sidebar-style="light">...</div>

<!-- Dark Sidebar (default in dark theme) -->
<div data-sidebar-style="dark">...</div>

<!-- Primary Brand Sidebar (deep teal/brand tint) -->
<div data-sidebar-style="primary">...</div>

<!-- Accent Sidebar -->
<div data-sidebar-style="accent">...</div>

<!-- Accent Light Sidebar -->
<div data-sidebar-style="accent-light">...</div>
```

---

## Component API Reference

### Core Primitives

#### `<SidebarProvider>`

| Prop               | Type                      | Default     | Description                                                 |
| ------------------ | ------------------------- | ----------- | ----------------------------------------------------------- |
| `defaultOpen`      | `boolean`                 | `true`      | Uncontrolled default desktop open state                     |
| `open`             | `boolean`                 | `undefined` | Controlled desktop open state                               |
| `onOpenChange`     | `(open: boolean) => void` | `undefined` | Callback fired on desktop open change                       |
| `mobileBreakpoint` | `number`                  | `768`       | Viewport breakpoint (px) for mobile drawer mode             |
| `renderWrapper`    | `boolean`                 | `true`      | Set `false` to omit outer `<div>` and bind vars to `<html>` |

#### `<Sidebar>`

| Prop          | Type                              | Default     | Description                                |
| ------------- | --------------------------------- | ----------- | ------------------------------------------ |
| `side`        | `'left' \| 'right'`               | `'left'`    | Edge of the viewport to anchor the sidebar |
| `collapsible` | `'icon' \| 'offcanvas' \| 'none'` | `'icon'`    | Desktop collapse behavior                  |
| `className`   | `string`                          | `undefined` | Additional classes for the sidebar panel   |

#### `<SidebarTrigger>`

| Prop        | Type        | Default                 | Description              |
| ----------- | ----------- | ----------------------- | ------------------------ |
| `icon`      | `ReactNode` | `<SidebarSimpleIcon />` | Custom toggle icon glyph |
| `className` | `string`    | `undefined`             | Additional classes       |

#### `<SidebarInset>`

Container for the main application content rendered adjacent to `<Sidebar>`. Applies `min-w-0 flex-1 flex-col` to ensure proper flex shrinking and avoid page-level horizontal overflow.

#### `<SidebarContent>`

Scrollable container wrapping navigation menus. Built on Radix `ScrollArea` with an accessible custom scrollbar.

- Default `type="hover"` (scrollbar fades in on hover and hides when idle).
- Scrollbar is automatically suppressed in collapsed icon rail mode.

---

### Menu & Accordion Primitives

#### `<SidebarMenuButton>`

Interactive button row for navigation items.

| Prop              | Type      | Default     | Description                                         |
| ----------------- | --------- | ----------- | --------------------------------------------------- |
| `active`          | `boolean` | `false`     | Highlights row with `--nav-item-active-bg`          |
| `asChild`         | `boolean` | `false`     | Delegates rendering to child element via Radix Slot |
| `tooltip`         | `string`  | `undefined` | Tooltip displayed in collapsed icon rail mode       |
| `disabled`        | `boolean` | `false`     | Disables interaction and dims opacity to 50%        |
| `disabledTooltip` | `string`  | `undefined` | Tooltip explaining why the item is disabled         |

#### `<SidebarMenuBadge>`

Pill badge component for counts and status indicators. Automatically hides in collapsed icon rail mode.

#### `<SidebarMenuAccordion>`

Collapsible menu group featuring an animated slide transition driven by `ResizeObserver`.

| Prop              | Type                      | Default     | Description                              |
| ----------------- | ------------------------- | ----------- | ---------------------------------------- |
| `title`           | `ReactNode`               | _required_  | Header label or element                  |
| `icon`            | `ReactNode`               | `undefined` | Leading icon                             |
| `badge`           | `ReactNode`               | `undefined` | Trailing badge or indicator before caret |
| `open`            | `boolean`                 | `undefined` | Controlled open state                    |
| `onOpenChange`    | `(open: boolean) => void` | `undefined` | Callback fired on open change            |
| `disabled`        | `boolean`                 | `false`     | Disables accordion toggle                |
| `disabledTooltip` | `string`                  | `undefined` | Explains why accordion is disabled       |

#### `<SidebarMenuTree>`

Recursive menu tree renderer for hierarchical categories (such as cloud resource menus).

| Prop              | Type                                       | Default         | Description                                |
| ----------------- | ------------------------------------------ | --------------- | ------------------------------------------ |
| `items`           | `SidebarMenuTreeItem[]`                    | _required_      | Tree data structure                        |
| `renderItem`      | `(item: SidebarMenuTreeItem) => ReactNode` | _required_      | Renderer for leaf nodes                    |
| `maxVisibleItems` | `number`                                   | `undefined`     | Truncation limit before "Show more" toggle |
| `moreLabel`       | `(hidden: number) => ReactNode`            | `"Show N more"` | Label for the expand toggle                |
| `lessLabel`       | `ReactNode`                                | `"Show less"`   | Label for the collapse toggle              |
| `moreTooltip`     | `(hidden: number) => ReactNode`            | `undefined`     | Tooltip for the collapsed toggle row       |
| `openId`          | `string`                                   | `undefined`     | Controlled open accordion ID               |
| `onToggle`        | `(id: string) => (open: boolean) => void`  | `undefined`     | Controlled toggle handler                  |

---

### Convenience Wrappers

- **`SidebarBrand`**: Header row with a quick shortcuts launcher, centered logo, and collapse toggle.
- **`SidebarModeCard`**: Workspace context card (Organization, Project, Admin) with mode switcher affordance.
- **`SidebarCallToAction`**: Outlined primary action button (e.g. "+ Add resource") placed at the top of menu lists.
- **`SidebarNavItem`**: Standard navigation item with optional `href` or `onClick`.
- **`SidebarMenuLinkItem`**: Router-agnostic link wrapper for integration with routing libraries.
- **`SidebarSection`**: Pre-composed section wrapping `SidebarGroup`, `SidebarGroupLabel`, and `SidebarMenu`.
- **`SidebarToggleGraphic`**: Canonical SVG glyph for the collapse button.

---

## Implementation Recipes

### 1. Minimal Responsive Sidebar

```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarNavItem,
  SidebarTrigger,
  SidebarInset,
} from 'waldur-ui';
import { HouseIcon, GearIcon } from '@phosphor-icons/react';

export function MinimalApp() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarNavItem
              icon={<HouseIcon />}
              label="Home"
              href="/home"
              active
            />
            <SidebarNavItem
              icon={<GearIcon />}
              label="Settings"
              href="/settings"
            />
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 border-b">
          <SidebarTrigger />
        </header>
        <main className="p-6">Content goes here...</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### 2. Nested Accordion Menus

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuAccordion,
  SidebarNavItem,
  SidebarMenuBadge,
} from 'waldur-ui';
import { CloudIcon, DatabaseIcon } from '@phosphor-icons/react';

export function CloudResourcesMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuAccordion
        title="Compute"
        icon={<CloudIcon />}
        badge={<SidebarMenuBadge>12</SidebarMenuBadge>}
      >
        <SidebarNavItem label="Virtual Machines" href="/vms" />
        <SidebarNavItem label="Bare Metal" href="/baremetal" />
      </SidebarMenuAccordion>

      <SidebarMenuAccordion
        title="Storage"
        icon={<DatabaseIcon />}
        badge={<SidebarMenuBadge>4</SidebarMenuBadge>}
      >
        <SidebarNavItem label="Block Volumes" href="/volumes" />
        <SidebarNavItem label="Object Storage" href="/buckets" />
      </SidebarMenuAccordion>
    </SidebarMenu>
  );
}
```

### 3. Recursive Tree with Truncation

```tsx
import {
  SidebarMenuTree,
  SidebarMenuTreeItem,
  SidebarNavItem,
} from 'waldur-ui';

const CATEGORIES: SidebarMenuTreeItem[] = [
  {
    id: '1',
    title: 'OpenStack',
    children: [
      { id: '1-1', title: 'Instances' },
      { id: '1-2', title: 'Volumes' },
    ],
  },
  {
    id: '2',
    title: 'Kubernetes',
    children: [{ id: '2-1', title: 'Clusters' }],
  },
  { id: '3', title: 'SLURM' },
  { id: '4', title: 'PostgreSQL' },
  { id: '5', title: 'MySQL' },
  { id: '6', title: 'Ceph' },
];

export function TruncatedTree() {
  return (
    <SidebarMenuTree
      items={CATEGORIES}
      maxVisibleItems={3}
      moreLabel={(count) => `Show ${count} more categories`}
      renderItem={(item) => (
        <SidebarNavItem
          label={typeof item.title === 'string' ? item.title : ''}
          onClick={() => console.log('Selected:', item.id)}
        />
      )}
    />
  );
}
```

### 4. Router-Integrated Links (`SidebarMenuLinkItem`)

When integrating with routing frameworks (such as UI-Router, React Router, or TanStack Router):

```tsx
import { SidebarMenuLinkItem } from 'waldur-ui';
import { Link, useIsActive } from '@uirouter/react';
import { FolderIcon } from '@phosphor-icons/react';

export function RouterMenuItem({ to, title, icon }) {
  const active = useIsActive(to);

  return (
    <SidebarMenuLinkItem
      title={title}
      icon={icon}
      active={active}
      renderLink={(content) => (
        <Link to={to} className="w-full">
          {content}
        </Link>
      )}
    />
  );
}
```

### 5. Headless Provider for Custom Page Shells

When the outer application shell manages its own layout containers (e.g. fixed navigation wrappers):

```tsx
<SidebarProvider renderWrapper={false} mobileBreakpoint={992}>
  {/* CSS variables (--sidebar-width, --sidebar-width-icon) are injected into <html> */}
  <div className="custom-app-layout">
    <Sidebar />
    <div className="custom-page-body">
      <AppHeader />
      <AppContent />
    </div>
  </div>
</SidebarProvider>
```

---

## Accessibility (a11y) & UX Considerations

1. **Semantic HTML Elements**:
   - Navigation is structured using `<nav>`, `<ul>`, `<li>`, and `<button>`.
   - Menus utilize `role="separator"` on horizontal dividers.
   - Screen-reader-only headings (`<SheetHeader className="sr-only">`) satisfy dialog title accessibility requirements in the mobile Sheet.

2. **Keyboard Navigation & Focus Management**:
   - `SidebarTrigger` reflects its state via `aria-pressed={state === 'collapsed'}` and provides clear `aria-label="Toggle sidebar"`.
   - Collapsed desktop triggers reveal on `:focus-visible`, allowing full keyboard controllability even when hidden visually in hover mode.

3. **Dual Tooltip Strategy**:
   - **Collapsed Tooltip**: `<SidebarMenuButton tooltip="...">` shows an icon explanation on the right side only when the sidebar is collapsed into the icon rail. It automatically suppresses when expanded or hover-expanded to avoid redundant tooltips.
   - **Disabled Tooltip**: `<SidebarMenuButton disabled disabledTooltip="...">` explains why an action cannot be performed, and appears unconditionally when disabled regardless of whether the sidebar is collapsed or expanded. Because disabled buttons and elements with `pointer-events: none` suppress browser pointer events and keyboard focus, the trigger is wrapped in an interactive container (`<span tabIndex={0} className="... cursor-not-allowed ...">`) ensuring the tooltip reliably opens on both pointer hover and keyboard focus across all browsers.
