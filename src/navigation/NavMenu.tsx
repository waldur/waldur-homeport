import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@/core/constants';

/**
 * Radix-driven replacement for the header/footer/sidebar-popup menus built
 * on Metronic's own imperative menu-trigger system (driven by Popper.js
 * directly, now fully removed) — a *different* system from
 * `ActionsDropdown.tsx`, which replaces react-bootstrap's `<Dropdown>`
 * and wears Bootstrap's `.dropdown-menu`/`.dropdown-item` classes. These
 * wear Metronic's own
 * `.menu`/`.menu-sub`/`.menu-sub-dropdown`/`.menu-item`/`.menu-link`
 * classes (`src/metronic/sass/core/components/menu/`), which is a
 * separate, larger stylesheet also used by the sidebar's *accordion* tree
 * (`.menu-sub-accordion` — a different Radix primitive, Collapsible, not
 * this file's DropdownMenu; see `src/navigation/sidebar/MenuAccordion.tsx`).
 *
 * Same "one axis at a time" principle as ActionsDropdown.tsx: Radix
 * supplies behaviour/positioning/accessibility, the existing compiled
 * Metronic CSS keeps supplying 100% of the appearance. No new visual
 * styling is introduced anywhere in this file.
 *
 * ## Why `.menu-sub-dropdown`'s existing CSS mostly works unmodified
 *
 * `menu/_base.scss` gates the submenu's visibility and entrance animation
 * behind `&.show[data-popper-placement]` (Metronic's own Popper.js sets
 * that attribute; presence alone is enough to satisfy the selector, its
 * *value* only matters for one animation-direction branch — see below).
 * `NavMenuContent`/`NavMenuSubContent` add `.show` and a
 * `data-popper-placement` attribute themselves, so Metronic's own
 * `.menu-sub-dropdown.show[data-popper-placement] { display: flex; … }`
 * rule fires exactly as compiled for shadow, radius, background, and
 * z-index — no new CSS needed there, reused as-is. The entrance
 * *animation* is the one piece that isn't reused unmodified: core's own
 * keyframes slide the panel in via margin-top/margin-bottom, which fights
 * Radix's own ResizeObserver-driven repositioning frame-for-frame and
 * visibly stutters — `custom/_menu.scss` overrides it for Radix content
 * only (scoped off the `data-side` attribute below) with a
 * `translate`-based equivalent, see that file's own comment.
 *
 * `data-popper-placement`'s value here is *not* meant to reflect Radix's
 * real resolved side after collision-avoidance flips it (Radix doesn't
 * expose that as a string this shape) — it only needs to be *present* to
 * satisfy that selector, and separately to correctly exclude the submenu
 * from the accordion-mode indentation mixin
 * (`.menu-sub:not([data-popper-placement])` in `mixins/_menu.scss`,
 * which only applies to the sidebar's accordion tree). The one exception —
 * the entrance animation's "top placement gets move-down instead of
 * move-up" branch, keyed off `[data-popper-placement^='top']`'s actual
 * *value* — is bridged separately in `src/metronic/sass/custom/_menu.scss`
 * against Radix's own `data-side` attribute instead, which *does*
 * accurately reflect any collision-driven flip. See that file's comment.
 *
 * ## Keyboard highlight
 *
 * `.menu-link:hover` is a plain CSS pseudo-class, so mouse hover already
 * works with zero changes. Radix's keyboard navigation instead marks the
 * focused row with `[data-highlighted]` (not `:hover`/`:focus` — same gap
 * documented for `.dropdown-item` in `custom/_dropdown.scss`), so
 * `custom/_menu.scss` maps `.menu-link[data-highlighted]` onto the same
 * hover treatment `.menu-link:hover` already gets.
 */

const PLACEMENT_TO_SIDE_ALIGN = (
  placement: string,
): {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
} => {
  const [side, align] = placement.split('-') as [
    'top' | 'right' | 'bottom' | 'left',
    'start' | 'end' | undefined,
  ];
  return { side, align: align ?? 'center' };
};

/**
 * Metronic's original responsive trigger config for these rows — click
 * below the `lg` breakpoint, hover at `lg` and up — reproduced here for
 * a *top-level* trigger. Genuinely different from a Sub's hover-open
 * (which Radix's SubTrigger supports natively): this is a plain
 * Root/Trigger, and Radix's DropdownMenuTrigger only ever opens on
 * click/keyboard, with no built-in hover mode. Reproduced by hand
 * instead: `open` is lifted and controlled, and the returned
 * `hoverHandlers` need spreading onto *both* the trigger and the content
 * (leaving off either one closes the menu the instant the pointer
 * crosses the small visual gap between the button and its panel while
 * moving toward it), gated to `lg`+ only. The 200ms close-on-leave delay
 * isn't invented: it's Metronic's own imperative menu JS's default
 * (`defaultMenuOptions.dropdown.hoverTimeout`, from the now-deleted
 * class that used to drive this), ported so a pointer momentarily
 * leaving the panel while crossing back toward the trigger doesn't
 * visibly flicker the menu shut. Shared by FooterDropdown.tsx and
 * TabsList.tsx — both real, independent top-level triggers with this
 * exact original trigger config, not a coincidence.
 *
 * `requireDesktop` (default `true`) gates hover to the `lg`+ breakpoint,
 * matching that click-below/hover-at-`lg`+ config. Pass `false` for a
 * trigger whose original config was unconditionally hover, no
 * responsive variant at all — hover is then unconditional, at every
 * viewport width (PageBarTabs.tsx's in-page section tabs).
 */
export function useHoverMenu(requireDesktop = true) {
  const isDesktopQuery = useMediaQuery({ minWidth: GRID_BREAKPOINTS.lg });
  const isDesktop = requireDesktop ? isDesktopQuery : true;
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  const hoverHandlers = {
    onMouseEnter: () => {
      if (!isDesktop) return;
      cancelClose();
      setOpen(true);
    },
    onMouseLeave: () => {
      if (!isDesktop) return;
      cancelClose();
      closeTimeout.current = setTimeout(() => setOpen(false), 200);
    },
  };

  return { isDesktop, open, setOpen, hoverHandlers };
}

export const NavMenu = RadixDropdownMenu.Root;
export const NavMenuTrigger = RadixDropdownMenu.Trigger;

/**
 * A command row — Metronic's `.menu-item` (layout wrapper, itself carries
 * no interactivity in the original markup) around `.menu-link` (the real
 * clickable target). Radix's Item behaviour attaches directly to the
 * `.menu-link` element (via `asChild` when a real link/button is composed,
 * or rendered as Item's own default `<div role="menuitem">` otherwise),
 * matching how `ActionsDropdownItem` attaches Bootstrap's `.dropdown-item`
 * class directly to the Radix Item rather than to a separate wrapper.
 */
export const NavMenuItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
    wrapperClassName?: string;
  }
>(({ className, wrapperClassName, ...props }, ref) => (
  <div className={classNames('menu-item', wrapperClassName)}>
    <RadixDropdownMenu.Item
      ref={ref}
      className={classNames('menu-link', className)}
      {...props}
    />
  </div>
));
NavMenuItem.displayName = 'NavMenuItem';

export function NavMenuContent({
  className,
  placement = 'bottom-start',
  sideOffset = 2,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content> & {
  /** Same placement strings Metronic's own placement config used, e.g.
   * `"bottom-start"`, `"left-start"`, `"top-end"`. */
  placement?: string;
}) {
  const { side, align } = PLACEMENT_TO_SIDE_ALIGN(placement);
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        data-popper-placement={placement}
        className={classNames('menu-sub menu-sub-dropdown show', className)}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}

export const NavMenuSub = RadixDropdownMenu.Sub;

/**
 * A row that opens a nested submenu — Metronic's original hover-to-open
 * trigger config (LanguageSelectorDropdown, UserDropdownMenuItems'
 * per-item children). Radix's SubTrigger already opens on hover *or*
 * click by default, matching that behaviour with no extra wiring.
 *
 * `arrow` defaults to false: neither of this migration's two real
 * call sites rendered Metronic's `.menu-arrow` chevron in their original
 * markup (their own content — a flag+text badge, a caret-less nested tab
 * label — already signalled "this expands" some other way), so making it
 * opt-in avoids silently adding a visual element that wasn't there before.
 * Pass `arrow` for a submenu whose original markup did include one.
 */
export const NavMenuSubTrigger = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
    wrapperClassName?: string;
    arrow?: boolean;
  }
>(({ className, wrapperClassName, arrow = false, children, ...props }, ref) => (
  <div className={classNames('menu-item', wrapperClassName)}>
    <RadixDropdownMenu.SubTrigger
      ref={ref}
      className={classNames('menu-link', className)}
      {...props}
    >
      {children}
      {arrow && <span className="menu-arrow" />}
    </RadixDropdownMenu.SubTrigger>
  </div>
));
NavMenuSubTrigger.displayName = 'NavMenuSubTrigger';

export function NavMenuSubContent({
  className,
  placement = 'right-start',
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent> & {
  placement?: string;
}) {
  // SubContent's own `align` deliberately excludes "center" — a flyout
  // submenu always aligns start/end against its trigger row, never
  // centers — so the shared helper's "center" default is narrowed here.
  const { align: rawAlign } = PLACEMENT_TO_SIDE_ALIGN(placement);
  const align = rawAlign === 'center' ? 'start' : rawAlign;
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.SubContent
        align={align}
        data-popper-placement={placement}
        className={classNames('menu-sub menu-sub-dropdown show', className)}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}
