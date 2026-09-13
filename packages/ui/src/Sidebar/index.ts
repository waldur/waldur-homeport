/**
 * Sidebar Navigation Component Suite
 *
 * A multi-tiered navigation system combining Radix primitives and Tailwind design tokens:
 *
 * 1. Core Shell & Context (`context`, `SidebarProvider`, `SidebarRoot`, `SidebarLayout`):
 *    - Responsive drawer (mobile Radix Sheet) and desktop rail (`300px` <-> `3rem`).
 *    - Desktop hover-expansion without adjacent content reflow.
 *    - Custom Radix ScrollArea with themed scrollbars.
 *
 * 2. Menu Navigation & Accordions (`SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuTree`):
 *    - Multi-level nested accordions with animated height transitions.
 *    - Depth-aware padding indentation and bullet spacers.
 *    - Sibling-exclusive expansion coordination.
 *    - Recursive category trees with pagination truncation ("show more").
 *
 * 3. Convenience Components (`SidebarConvenience`, `SidebarToggleGraphic`):
 *    - Brand header with quick shortcuts launcher, logo slot, and collapse toggle glyph.
 *    - Workspace / Mode switcher card.
 *    - Prominent call-to-action button.
 *    - Router-agnostic navigation link wrappers.
 */

export * from './context';
export * from './SidebarProvider';
export * from './SidebarRoot';
export * from './SidebarLayout';
export * from './SidebarMenuButton';
export * from './SidebarMenuSub';
export * from './SidebarConvenience';
export * from './SidebarMenuTree';
export * from './SidebarToggleGraphic';
