import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from './cn';

/**
 * shadcn's actual Avatar recipe (wraps @radix-ui/react-avatar's
 * Root/Image/Fallback — see https://ui.shadcn.com/docs/components/avatar)
 * — background/text colors point at
 * waldur-design-tokens/surfaceColors.css's --badge-brand-* tokens instead
 * of shadcn's own default palette. TopBar's exported `Avatar` (a simple
 * `initials`-only convenience wrapper) composes these.
 *
 * Deliberately NOT --nav-item-active-*: those became SIDEBAR_STYLE-variable
 * (see surfaceColors.css) and some variants use low-contrast fills
 * (rgba(255,255,255,0.15), pale accent-light tints) unsuitable for a
 * generic colored-initials badge that has nothing to do with sidebar nav
 * state.
 */
export const AvatarRoot = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn(
      'relative flex size-8 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
);

export const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    className={cn('size-full object-cover', className)}
    {...props}
  />
);

export const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      'flex size-full items-center justify-center rounded-full bg-[var(--badge-brand-bg)] text-xs font-semibold text-[var(--badge-brand-text)]',
      className,
    )}
    {...props}
  />
);
