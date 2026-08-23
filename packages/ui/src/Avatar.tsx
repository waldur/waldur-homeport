import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from './cn';

/**
 * shadcn's actual Avatar recipe (wraps @radix-ui/react-avatar's
 * Root/Image/Fallback — see https://ui.shadcn.com/docs/components/avatar)
 * — background/text colors point at
 * waldur-design-tokens/surfaceColors.css's --nav-item-active-* tokens
 * instead of shadcn's own default palette. TopBar's exported `Avatar`
 * (a simple `initials`-only convenience wrapper) composes these.
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
      'flex size-full items-center justify-center rounded-full bg-[var(--nav-item-active-bg)] text-xs font-semibold text-[var(--nav-item-active-text)]',
      className,
    )}
    {...props}
  />
);
