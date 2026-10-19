import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, forwardRef, ReactNode } from 'react';

import { AvatarFallback, AvatarImage, AvatarRoot } from '../Avatar';
import { ICON_BUTTON_BASE_CLASSNAME } from '../Button';
import { cn } from '../cn';
import { Menu } from '../Menu';
import { Tooltip } from '../Tooltip';

/**
 * A new dashboard primitive — no org/customer switcher dropdown exists
 * anywhere in waldur-homeport's own src/ today (AppHeader.tsx has no such
 * control; OrganizationsListMenu.tsx is a sidebar link to a list page, not
 * a switcher). Built directly against a design mockup.
 *
 * OrgSwitcher is waldur-ui's Menu in the nav look (see Menu.tsx) — the
 * consumer composes the actual menu (Menu.Item/Label/Separator) as
 * children, the same way Sidebar's nav sections are composed by the
 * consumer rather than hardcoded, since this primitive has no org-list
 * data of its own.
 */
export interface TopBarProps extends ComponentProps<'header'> {
  /** Leading controls, such as the mobile navigation toggle and logo. */
  left?: ReactNode;
  /** The flexible middle: breadcrumbs, a back button, a search field. */
  center?: ReactNode;
  /** The fixed action cluster at the end. Children carry their own spacing. */
  right?: ReactNode;
}

/**
 * The app header's bar, ported from Metronic's `.header` and the
 * `.container-fluid` inside it (layout/_header.scss, layout/_main.scss):
 * 55px tall with 15px side padding, 65px and 32px from `lg` (992px), a
 * 1px `border-secondary` rule at the bottom (inside the height) and the
 * `bg-primary` surface. Measured identical to it in the signed-in app.
 *
 * Only the bar: where it sits (fixed, beside the sidebar, its z-index) is
 * the page layout's business and comes in through `className`.
 */
export const TopBar = ({
  left,
  center,
  right,
  className,
  ...props
}: TopBarProps) => (
  <header
    className={cn(
      'flex h-[55px] shrink-0 items-stretch justify-between px-[15px] lg:h-[65px] lg:px-[32px]',
      'border-b-[1px] border-b-secondary bg-primary',
      className,
    )}
    {...props}
  >
    {left && <div className="flex min-w-0 items-center gap-3">{left}</div>}
    {/* Always rendered, so the actions stay at the end. flex-basis 0 makes
        its width the grown share of free space, whatever its content's
        width, and overflow-hidden clips it: a long breadcrumb trail can
        never push the actions off screen, and gets a real width to
        measure its own overflow against. min-w-0 lets it shrink at all —
        flex items default to min-width:auto, which ignores flex-shrink. */}
    <div className="flex min-w-0 shrink grow basis-0 items-stretch overflow-hidden">
      {center}
    </div>
    {right && (
      <div className="ms-[0.75rem] flex shrink-0 items-stretch">{right}</div>
    )}
  </header>
);

export interface OrgSwitcherProps {
  badge?: ReactNode;
  name: string;
  /** Composed as the dropdown's content — Menu.Item/Label/Separator. */
  children?: ReactNode;
  className?: string;
}

export const OrgSwitcher = ({
  badge,
  name,
  children,
  className,
}: OrgSwitcherProps) => (
  <Menu>
    <Menu.Trigger asChild>
      <button
        type="button"
        className={cn(
          // min-w-0 lets this shrink below the name's natural width inside
          // a flex parent (e.g. TopBar's left slot on a narrow viewport) —
          // flex items default to min-width:auto, which ignores flex-shrink
          // and any child's own truncate class otherwise.
          'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium',
          // --bg-primary-hover, not --nav-item-hover-bg: OrgSwitcher sits in
          // the TopBar, not the sidebar, so it shouldn't inherit the
          // sidebar's own SIDEBAR_STYLE-driven hover color.
          'text-primary hover:bg-primary-hover',
          className,
        )}
      >
        {badge && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-600 text-xs font-semibold text-white">
            {badge}
          </span>
        )}
        <span className="truncate">{name}</span>
        <CaretDownIcon
          size={14}
          className="shrink-0 text-quinary"
          weight="bold"
        />
      </button>
    </Menu.Trigger>
    {children && (
      <Menu.Content
        align="start"
        className="py-[12px] text-sm font-medium min-w-[200px]"
      >
        {children}
      </Menu.Content>
    )}
  </Menu>
);

export interface SearchFieldProps {
  placeholder?: string;
  shortcutHint?: string;
  className?: string;
}

/** Visual only — no real search wiring; the consumer owns the input's state/handlers. */
export const SearchField = ({
  placeholder = 'Search',
  shortcutHint,
  className,
}: SearchFieldProps) => (
  <div
    className={cn(
      'flex w-full max-w-md items-center gap-2 rounded-lg border-[1px] px-3 py-2 text-sm',
      'border-secondary bg-[var(--card-bg)] text-quinary',
      className,
    )}
  >
    <MagnifyingGlassIcon size={16} weight="bold" />
    <span className="flex-1 text-left">{placeholder}</span>
    {shortcutHint && (
      <kbd className="rounded border-[1px] border-secondary px-1.5 py-0.5 text-xs">
        {shortcutHint}
      </kbd>
    )}
  </div>
);

export interface IconButtonProps extends ComponentProps<'button'> {
  icon: ReactNode;
  label: string;
  /** The default "something new" dot: green, blinking, on the top corner. */
  hasIndicator?: boolean;
  /** A marker of the caller's own, drawn instead of the default dot. */
  indicator?: ReactNode;
  /** `md` is the header's icon, `lg` the mobile navigation toggle's. */
  iconSize?: VariantProps<typeof iconButton>['iconSize'];
  /**
   * `header` is the app header's button. `base` is the plain 36px square the
   * sidebar's own buttons share (ICON_BUTTON_BASE_CLASSNAME), for a caller
   * that restyles it, such as the sidebar's shortcuts button.
   */
  variant?: VariantProps<typeof iconButton>['variant'];
}

/**
 * The header look is Metronic's `.btn-nav-item` with its `.svg-icon
 * svg-icon-2` icon, which it replaced after a pixel comparison of the two;
 * e2e-visual/top-bar-geometry.spec.ts keeps its measured size and spacing:
 *
 * - 40px square, 6px radius, the header's own surface (`bg-primary`).
 * - Icon in rem, not px: 1.54rem (`svg-icon-2`) and 1.85rem (`svg-icon-1x`),
 *   so it shrinks with the 12px mobile root (20px → 18.5px) as it did.
 * - Hover, keyboard focus and `aria-expanded` (the drawer the button opens is
 *   showing) fill with `--btn-secondary-bg` and turn the icon brand.
 * - The ring is the old 0.155rem box-shadow, but on `:focus-visible` only.
 *   The old one also showed on `:focus`/`:active`, so a clicked button kept
 *   its ring and fill until focus moved elsewhere; `aria-expanded` now says
 *   whether its drawer is open, which is what that lingering state stood in
 *   for. The one deliberate difference from the original.
 * - Timing as before: the fill 0.2s, the icon colour 0.3s.
 */
const iconButton = cva('relative', {
  variants: {
    variant: {
      header: [
        'flex size-[40px] shrink-0 items-center justify-center rounded-md border-0 bg-primary p-[0px] text-quinary outline-none',
        'transition-all duration-200 ease-[ease]',
        '[&_svg]:transition-colors [&_svg]:duration-300 [&_svg]:ease-[ease]',
        'hover:bg-[var(--btn-secondary-bg)] hover:text-[var(--text-brand-secondary)]',
        'focus-visible:bg-[var(--btn-secondary-bg)] focus-visible:text-[var(--text-brand-secondary)]',
        'focus-visible:shadow-[0_0_0_0.155rem_var(--border-brand-solid)]',
        'aria-expanded:bg-[var(--btn-secondary-bg)] aria-expanded:text-[var(--text-brand-secondary)]',
      ],
      base: ICON_BUTTON_BASE_CLASSNAME,
    },
    iconSize: {
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    { variant: 'header', iconSize: 'md', className: '[&_svg]:size-[1.54rem]' },
    { variant: 'header', iconSize: 'lg', className: '[&_svg]:size-[1.85rem]' },
  ],
  defaultVariants: { variant: 'header', iconSize: 'md' },
});

/**
 * Extends ComponentProps<'button'> (not just onClick/className, the
 * original scope) and forwards its ref, so a Menu.Trigger asChild
 * can compose this directly — Radix's Slot clones its child, attaches its
 * own ref (Popper needs it to position the menu against this element),
 * and merges in aria-haspopup/aria-expanded/data-state and its own
 * open-on-click handling. Without forwardRef, React silently drops the
 * ref ("Function components cannot be given refs"), Popper never gets a
 * real anchor element, and every consumer downstream of that — not just
 * this button — breaks (observed as the whole dashboard crashing the
 * instant a Menu.Trigger wrapped a pre-forwardRef IconButton, not
 * merely the menu failing to open). The forwarded ref lands on the same
 * <button> Tooltip's own Trigger asChild already puts a ref on; Radix's
 * Slot composes multiple refs on one element rather than clobbering, so
 * both work together.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      hasIndicator,
      indicator,
      iconSize,
      variant,
      className,
      ...props
    },
    ref,
  ) => (
    <Tooltip label={label} side="bottom">
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(iconButton({ variant, iconSize }), className)}
        {...props}
      >
        {icon}
        {indicator ??
          (hasIndicator && (
            // The app header's HeaderButtonBullet in its default look: green
            // (not danger, which is for errors) and blinking, centred on the
            // button's top corner, a half-dot in from the edge.
            <span className="animation-blink absolute end-0 top-0 inline-block size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-success" />
          ))}
      </button>
    </Tooltip>
  ),
);
IconButton.displayName = 'IconButton';

export interface AvatarProps {
  initials: string;
  imageSrc?: string;
  className?: string;
}

/**
 * Convenience wrapper over Avatar.tsx's shadcn-recipe primitives, for the
 * common initials(+optional image) case — reach for AvatarRoot/AvatarImage/
 * AvatarFallback directly for anything more custom. AvatarImage (Radix),
 * not a plain <img>: Radix only renders it once the image has actually
 * loaded, so AvatarFallback shows through automatically while loading or
 * on a broken URL — a plain <img> has no such fallback behavior on error.
 */
export const Avatar = ({ initials, imageSrc, className }: AvatarProps) => (
  <AvatarRoot className={className}>
    {imageSrc && <AvatarImage src={imageSrc} alt={initials} />}
    <AvatarFallback>{initials}</AvatarFallback>
  </AvatarRoot>
);
