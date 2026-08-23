import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { ComponentProps, forwardRef, ReactNode } from 'react';

import { AvatarFallback, AvatarImage, AvatarRoot } from './Avatar';
import { cn } from './cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Tooltip } from './Tooltip';

/**
 * A new dashboard primitive — no org/customer switcher dropdown exists
 * anywhere in waldur-homeport's own src/ today (AppHeader.tsx has no such
 * control; OrganizationsListMenu.tsx is a sidebar link to a list page, not
 * a switcher). Built directly against a design mockup.
 *
 * OrgSwitcher is a real Radix DropdownMenu (see DropdownMenu.tsx) — the
 * consumer composes the actual menu (DropdownMenuItem/Label/Separator) as
 * children, the same way Sidebar's nav sections are composed by the
 * consumer rather than hardcoded, since this primitive has no org-list
 * data of its own.
 */
export interface TopBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export const TopBar = ({ left, center, right, className }: TopBarProps) => (
  <header
    className={cn(
      'flex h-16 shrink-0 items-center gap-4 border-b px-4',
      'border-[var(--surface-sidebar-border)] bg-[var(--surface-page-bg)]',
      className,
    )}
  >
    {/* min-w-0 on left/center (not right — its icon buttons are a fixed
        cluster, same as the real app's own header actions, which never
        shrink) lets a long org name or a wide center slot actually give
        way on a narrow viewport instead of forcing the header to overflow
        — flex items default to min-width:auto, which ignores flex-shrink
        otherwise. */}
    {left && (
      <div className="flex min-w-0 shrink items-center gap-3">{left}</div>
    )}
    {center && (
      <div className="flex min-w-0 flex-1 justify-center">{center}</div>
    )}
    {right && (
      <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>
    )}
  </header>
);

export interface OrgSwitcherProps {
  badge?: ReactNode;
  name: string;
  /** Composed as the dropdown's content — DropdownMenuItem/Label/Separator. */
  children?: ReactNode;
  className?: string;
}

export const OrgSwitcher = ({
  badge,
  name,
  children,
  className,
}: OrgSwitcherProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={cn(
          // min-w-0 lets this shrink below the name's natural width inside
          // a flex parent (e.g. TopBar's left slot on a narrow viewport) —
          // flex items default to min-width:auto, which ignores flex-shrink
          // and any child's own truncate class otherwise.
          'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium',
          'text-[var(--surface-text-primary)] hover:bg-[var(--nav-item-hover-bg)]',
          className,
        )}
      >
        {badge && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--nav-item-active-bg)] text-xs font-semibold text-[var(--nav-item-active-text)]">
            {badge}
          </span>
        )}
        <span className="truncate">{name}</span>
        <CaretDownIcon
          size={14}
          className="shrink-0 text-[var(--surface-text-muted)]"
          weight="bold"
        />
      </button>
    </DropdownMenuTrigger>
    {children && (
      <DropdownMenuContent align="start">{children}</DropdownMenuContent>
    )}
  </DropdownMenu>
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
      'flex w-full max-w-md items-center gap-2 rounded-lg border px-3 py-2 text-sm',
      'border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] text-[var(--surface-text-muted)]',
      className,
    )}
  >
    <MagnifyingGlassIcon size={16} weight="bold" />
    <span className="flex-1 text-left">{placeholder}</span>
    {shortcutHint && (
      <kbd className="rounded border border-[var(--surface-card-border)] px-1.5 py-0.5 text-xs">
        {shortcutHint}
      </kbd>
    )}
  </div>
);

export interface IconButtonProps extends ComponentProps<'button'> {
  icon: ReactNode;
  label: string;
  hasIndicator?: boolean;
}

/**
 * Extends ComponentProps<'button'> (not just onClick/className, the
 * original scope) and forwards its ref, so a DropdownMenuTrigger asChild
 * can compose this directly — Radix's Slot clones its child, attaches its
 * own ref (Popper needs it to position the menu against this element),
 * and merges in aria-haspopup/aria-expanded/data-state and its own
 * open-on-click handling. Without forwardRef, React silently drops the
 * ref ("Function components cannot be given refs"), Popper never gets a
 * real anchor element, and every consumer downstream of that — not just
 * this button — breaks (observed as the whole dashboard crashing the
 * instant a DropdownMenuTrigger wrapped a pre-forwardRef IconButton, not
 * merely the menu failing to open). The forwarded ref lands on the same
 * <button> Tooltip's own Trigger asChild already puts a ref on; Radix's
 * Slot composes multiple refs on one element rather than clobbering, so
 * both work together. See OrgDashboardMock.tsx's language switcher for
 * the first real consumer.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, hasIndicator, className, ...props }, ref) => (
    <Tooltip label={label} side="bottom">
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          'relative flex size-9 items-center justify-center rounded-lg text-[var(--surface-text-secondary)] hover:bg-[var(--nav-item-hover-bg)]',
          className,
        )}
        {...props}
      >
        {icon}
        {hasIndicator && (
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--pill-danger-dot)]" />
        )}
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
