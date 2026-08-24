import { CaretRightIcon, CheckIcon } from '@phosphor-icons/react';
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
 * surfaceColors.css's comment on that token. Same for the content
 * wrapper's radius (rounded-md, not shadcn's default rounded-lg) —
 * $dropdown-border-radius is $border-radius, the same ~6px value Card.tsx
 * uses, not the 8px rounded-lg would give.
 *
 * Scoped to what its consumers actually need — DropdownMenuCheckboxItem is
 * still omitted, but DropdownMenuRadioGroup/RadioItem and the
 * DropdownMenuSub* nested-submenu family are now here too. RadioItem
 * replaced three hand-rolled "leading CheckIcon, invisible unless selected"
 * DropdownMenuItems in OrgDashboardMock.tsx (org switcher, language list) —
 * same visual result, but role="menuitemradio"/aria-checked instead of a
 * plain menuitem with a cosmetic icon, and one indicator recipe instead of
 * three ad hoc ones that had already drifted (leading vs trailing, with vs
 * without ml-auto).
 *
 * max-h-(--radix-dropdown-menu-content-available-height) + overflow-y-auto
 * on the content wrapper IS part of that real shadcn recipe, not an extra
 * addition — Radix sets that CSS var to the actual space between the
 * trigger and the viewport edge, so long content (e.g. TopBar's user menu
 * with 18 language choices stacked above a token/IP block) scrolls inside
 * the menu instead of silently growing past the bottom of the screen with
 * no way to reach what's below.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

// Shared by DropdownMenuContent and DropdownMenuSubContent — a top-level
// menu and a submenu are the same floating surface, just anchored to a
// different trigger, so there's nothing here that should ever diverge
// between the two.
const MENU_PANEL_BASE_CLASSNAME = cn(
  'z-50 min-w-40 max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-[var(--dropdown-shadow)]',
  'border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-primary)]',
  // Plain opacity transition keyed off Radix's own data-state, not the
  // tailwindcss-animate plugin's animate-in/zoom-in-95 utilities — that
  // plugin isn't installed (and isn't Tailwind v4-native), so those class
  // names would silently generate no CSS at all. See Sheet.tsx for the
  // same reasoning. duration-300 matches Metronic's real
  // $menu.dropdown.animation-speed (0.3s, src/metronic/sass/core/
  // components/_variables.scss) — its own entrance slide
  // (animation-move-offset: 0.75rem) is still absent, the same
  // tailwindcss-animate-avoidance simplification.
  'transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
);

// Shared by DropdownMenuItem and DropdownMenuSubTrigger — every selectable
// row in the menu (act-on-click item, opens-a-submenu item, radio item)
// gets the same base layout/typography/hover treatment; only the
// selected/destructive/open-state color overrides differ per row kind.
const MENU_ROW_BASE_CLASSNAME =
  'flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none';

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(MENU_PANEL_BASE_CLASSNAME, className)}
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
        MENU_ROW_BASE_CLASSNAME,
        // --surface-hover-bg, not --nav-item-hover-bg: the latter is now
        // SIDEBAR_STYLE-variable (see surfaceColors.css) and can resolve to
        // a near-black fill (the "dark" style) — wrong for a dropdown menu
        // item that has nothing to do with the sidebar and sits on
        // --surface-card-bg, not the sidebar's own background.
        'text-[var(--surface-text-primary)] focus:bg-[var(--surface-hover-bg)] data-disabled:pointer-events-none data-disabled:opacity-50',
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

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        MENU_ROW_BASE_CLASSNAME,
        // data-[state=open] keeps the row highlighted while its submenu is
        // showing, same as DropdownMenuItem's own focus state — otherwise
        // the trigger looks unselected the moment the submenu steals focus.
        'text-[var(--surface-text-primary)] focus:bg-[var(--surface-hover-bg)] data-[state=open]:bg-[var(--surface-hover-bg)]',
        className,
      )}
      {...props}
    >
      {children}
      <CaretRightIcon
        size={14}
        weight="bold"
        className="ml-auto shrink-0 text-[var(--surface-text-muted)]"
      />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={cn(MENU_PANEL_BASE_CLASSNAME, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * shadcn's real recipe: an absolutely-positioned indicator in a left
 * gutter (pl-8 on the row makes room for it), not inline content — one
 * indicator recipe shared by every "pick one from this list" menu instead
 * of the three ad hoc ones this replaced in OrgDashboardMock.tsx (org
 * switcher, "no organisation" fallback, language list), which had already
 * drifted from each other (leading vs trailing checkmark, with vs without
 * ml-auto). Real role="menuitemradio"/aria-checked semantics come from
 * Radix for free — the ad hoc versions were plain menuitems with a
 * decorative icon, not actually exposed as selectable to assistive tech.
 */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        MENU_ROW_BASE_CLASSNAME,
        'relative pl-8',
        'text-[var(--surface-text-primary)] focus:bg-[var(--surface-hover-bg)] data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon size={14} weight="bold" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
