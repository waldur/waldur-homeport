import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ComponentProps } from 'react';

import { cn } from './cn';

/**
 * shadcn's Popover recipe (https://ui.shadcn.com/docs/components/popover),
 * ported the same way DropdownMenu.tsx was — surfaceColors.css tokens
 * instead of shadcn's --popover palette, and plain data-state-keyed
 * transitions rather than the tailwindcss-animate utilities (that plugin
 * isn't installed and isn't Tailwind v4-native, so animate-in/fade-in-0
 * would silently generate no CSS).
 *
 * ## Why this exists alongside DropdownMenu
 *
 * A Radix DropdownMenu is a *menu*: it owns focus with a roving tabindex
 * and treats plain keystrokes as typeahead to jump between items. That is
 * correct for a list of commands and actively wrong for anything
 * containing a form control — typing into a text input inside one either
 * moves the selection or never reaches the input at all.
 *
 * A large share of waldur-homeport's Metronic `menu-sub-dropdown` popups
 * are not menus in that sense. They render filter fields, selects, date
 * pickers, search boxes and Cancel/Apply footers (TableFiltersMenu /
 * TableFilterItem, AsyncSearchBox, MarketplaceLandingFilter, BoxRadioField,
 * RoleAndProjectSelectField), and TableColumnsButton is already a
 * react-bootstrap Popover rather than a Dropdown. Those all belong here.
 * The rule of thumb when migrating one: if it contains anything the user
 * types into or drags, it is a Popover; if every child is a command row,
 * it is a DropdownMenu.
 *
 * ## Parity with the Bootstrap popover it replaces
 *
 * Metronic sets `$popover-box-shadow: $dropdown-box-shadow` and
 * `$popover-border-radius: $border-radius` — a popover and a dropdown are
 * deliberately the same floating surface in this design system, so the
 * panel below reuses the same --dropdown-shadow token and rounded-md
 * radius DropdownMenu.tsx's own panel uses, rather than introducing a
 * second surface treatment. It is intentionally not shared as one exported
 * constant: the menu panel also carries menu-only concerns (p-1 item
 * gutter, min-w-40, the Metronic menu entrance) that a popover holding
 * arbitrary content must not inherit.
 *
 * Motion is Bootstrap's own `.fade` (opacity .15s linear), not the
 * dropdown's slide — the react-bootstrap popovers this replaces animate
 * through that class and nothing else.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-md border p-4 shadow-[var(--dropdown-shadow)] outline-hidden',
          'border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-primary)]',
          // Same reasoning as DropdownMenu's panel: Radix sets this CSS var
          // to the real distance between the trigger and the viewport edge,
          // so tall content (a long filter form) scrolls inside the popover
          // instead of growing past the bottom of the screen unreachably.
          'max-h-(--radix-popover-content-available-height) overflow-y-auto',
          'transition-opacity duration-150 [transition-timing-function:linear]',
          'data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
