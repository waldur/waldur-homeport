import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

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
 * panel below reuses the same --dropdown-shadow token and rounded-lg
 * radius (8px, the custom $border-radius) DropdownMenu.tsx's own panel uses, rather than introducing a
 * second surface treatment. It is intentionally not shared as one exported
 * constant: the menu panel also carries menu-only concerns (p-1 item
 * gutter, min-w-40, the Metronic menu entrance) that a popover holding
 * arbitrary content must not inherit.
 *
 * It has no motion of its own: a panel that wants the menus' entrance
 * adds `animate-[waldur-menu-enter-up_0.3s_ease]`. (An opacity transition
 * keyed on data-state never ran: Radix mounts the panel already open and
 * unmounts it on close.)
 *
 * A panel of command rows is a `Menu`; a panel of filter or picker rows
 * styled as menu rows is a `MenuPopover`. Everything else (forms, search
 * results, a column picker) is a Popover.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

/**
 * A floating card: the card surface (border, background, the dropdown
 * shadow, an 8px radius) on Bootstrap's popover layer, and nothing else —
 * no width, padding or height cap, since every panel lays out its own
 * content. A panel that may outgrow the screen caps itself, e.g. with
 * `max-h-(--radix-popover-content-available-height) overflow-y-auto`.
 */
export const PopoverContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /** Where the panel is portaled (default: document.body). */
    container?: HTMLElement;
  }
>(
  (
    { className, align = 'center', sideOffset = 4, container, ...props },
    ref,
  ) => (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-popover rounded-lg border shadow-[var(--dropdown-shadow)] outline-hidden',
          'border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-primary)]',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';
