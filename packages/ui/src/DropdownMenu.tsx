import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ComponentProps } from 'react';

import { cn } from './cn';

/**
 * shadcn's actual DropdownMenu recipe (see
 * https://ui.shadcn.com/docs/components/dropdown-menu), ported for
 * TopBar.tsx's OrgSwitcher. Colors point at
 * waldur-design-tokens/surfaceColors.css tokens instead of shadcn's own
 * default --popover/--accent palette, matching Sheet.tsx/Sidebar.tsx.
 * The shadow (--dropdown-shadow) isn't a generic Tailwind default either —
 * it's Metronic's own real dropdown-menu shadow value, see
 * surfaceColors.css's comment on that token.
 *
 * Scoped to what OrgSwitcher actually needs — DropdownMenuCheckboxItem,
 * DropdownMenuRadioGroup/RadioItem, and the DropdownMenuSub* nested-submenu
 * family are deliberately omitted; nothing in this codebase needs them yet.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-40 overflow-hidden rounded-lg border p-1 shadow-[var(--dropdown-shadow)]',
          'border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-primary)]',
          // Plain opacity transition keyed off Radix's own data-state, not
          // the tailwindcss-animate plugin's animate-in/zoom-in-95
          // utilities — that plugin isn't installed (and isn't Tailwind
          // v4-native), so those class names would silently generate no
          // CSS at all. See Sheet.tsx for the same reasoning. duration-300
          // matches Metronic's real $menu.dropdown.animation-speed (0.3s,
          // src/metronic/sass/core/components/_variables.scss) — its own
          // entrance slide (animation-move-offset: 0.75rem) is still
          // absent, the same tailwindcss-animate-avoidance simplification.
          'transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export interface DropdownMenuItemProps extends ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  variant?: 'default' | 'destructive';
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none',
        'text-[var(--surface-text-primary)] focus:bg-[var(--nav-item-hover-bg)] data-disabled:pointer-events-none data-disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        variant === 'destructive' &&
          'text-[var(--pill-danger-text)] focus:bg-[var(--pill-danger-bg)] focus:text-[var(--pill-danger-text)]',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-[var(--surface-text-muted)]',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn(
        '-mx-1 my-1 h-px bg-[var(--surface-card-border)]',
        className,
      )}
      {...props}
    />
  );
}
