import { XIcon } from '@phosphor-icons/react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, ElementRef, forwardRef } from 'react';

import { cn } from './cn';

/**
 * shadcn's actual Sheet recipe (a Radix Dialog wrapped with a slide-in
 * panel — see https://ui.shadcn.com/docs/components/sheet), ported for
 * Sidebar.tsx's mobile behavior (the desktop sidebar becomes a Sheet below
 * the mobile breakpoint). Colors point at
 * waldur-design-tokens/surfaceColors.css tokens instead of shadcn's own
 * default palette. The overlay background (--drawer-overlay-bg) and
 * content shadow (--drawer-shadow) are Metronic's own real "Drawer"
 * component values (its closest real equivalent to a slide-in Sheet), not
 * generic Tailwind defaults — see surfaceColors.css's comment on those
 * tokens.
 *
 * SheetOverlay/SheetContent/SheetTitle/SheetDescription are forwardRef —
 * not a style choice, an actual requirement: Radix's Dialog primitives
 * attach a ref to their immediate child to manage focus/pointer-tracking
 * internally, and a plain function component can't receive one. Omitting
 * this here once produced a real, reproducible "Function components cannot
 * be given refs" warning the moment Sidebar's mobile Sheet path mounted
 * (see useIsMobile.ts's own comment for why that path mounts more often
 * than its "only below 768px" name suggests) — same class of Radix
 * Slot-composition issue TopBar.tsx's IconButton documents for
 * DropdownMenuTrigger asChild.
 */
export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;

export const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitive.Overlay>,
  ComponentProps<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      // Plain opacity transition keyed off Radix's own data-state, not
      // the tailwindcss-animate plugin's animate-in/fade-in-0 utilities
      // — that plugin isn't installed (and isn't Tailwind v4-native), so
      // those class names would silently generate no CSS at all.
      'fixed inset-0 z-50 bg-[var(--drawer-overlay-bg)] transition-opacity duration-300 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 border-[var(--surface-sidebar-border)] bg-[var(--surface-sidebar-bg)] text-[var(--surface-text-primary)] shadow-[var(--drawer-shadow)] transition-transform duration-300 ease-in-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto border-b data-[state=closed]:-translate-y-full',
        bottom:
          'inset-x-0 bottom-0 h-auto border-t data-[state=closed]:translate-y-full',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:-translate-x-full sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:translate-x-full sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export interface SheetContentProps
  extends
    ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = 'right', ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-[var(--nav-item-active-bg)] focus:outline-hidden">
        <XIcon size={16} weight="bold" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

export const SheetTitle = forwardRef<
  ElementRef<typeof SheetPrimitive.Title>,
  ComponentProps<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      'font-semibold text-[var(--surface-text-primary)]',
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

export const SheetDescription = forwardRef<
  ElementRef<typeof SheetPrimitive.Description>,
  ComponentProps<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--surface-text-muted)]', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
