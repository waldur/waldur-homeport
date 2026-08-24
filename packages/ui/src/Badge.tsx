import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes } from 'react';

import { cn } from './cn';

/**
 * shadcn's actual Badge recipe (cva shape, variant names, focus-ring
 * treatment — see https://ui.shadcn.com/docs/components/badge) — not a
 * port of src/core/Badge.tsx (the existing Bootstrap Badge wrapper) or any
 * of src/'s feature-specific status badges. Colors point at
 * waldur-design-tokens/surfaceColors.css's --pill-* tokens instead of
 * shadcn's own default palette, so it fits this app's theme; the
 * structural recipe (base classes, variant shape, cva) is shadcn's.
 * StatusPill composes this rather than duplicating it.
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        success:
          'border-transparent bg-[var(--pill-success-bg)] text-[var(--pill-success-text)]',
        warning:
          'border-transparent bg-[var(--pill-warning-bg)] text-[var(--pill-warning-text)]',
        danger:
          'border-transparent bg-[var(--pill-danger-bg)] text-[var(--pill-danger-text)]',
        neutral:
          'border-transparent bg-[var(--pill-neutral-bg)] text-[var(--pill-neutral-text)]',
        // Metronic's real .badge-outline-purple (see surfaceColors.css's
        // comment on --pill-purple-*) — genuinely bordered, unlike the
        // other variants' border-transparent solid fill.
        purple:
          'border-[var(--pill-purple-border)] bg-[var(--pill-purple-bg)] text-[var(--pill-purple-text)]',
        outline: 'text-[var(--surface-text-primary)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
