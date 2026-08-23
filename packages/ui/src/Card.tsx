import { HTMLAttributes } from 'react';

import { cn } from './cn';

/**
 * shadcn's actual Card recipe (Card/CardHeader/CardTitle/CardDescription/
 * CardContent/CardFooter as plain div wrappers — see
 * https://ui.shadcn.com/docs/components/card) — background/border point at
 * waldur-design-tokens/surfaceColors.css's --surface-card-* tokens instead
 * of shadcn's own default palette. StatCard composes these rather than
 * duplicating the card shell.
 *
 * Shadow/border/radius/padding are Metronic's real .card values (see
 * src/metronic/sass/core/components/_card.scss and surfaceColors.css's
 * comment on --card-shadow/--card-border-color), not shadcn defaults or
 * guesses: real cards rely on the shadow alone in light mode (no border)
 * and flip to a border with no shadow in dark mode, at ~6px radius
 * (rounded-md, not shadcn's default rounded-xl) and 26px/29px
 * vertical/horizontal padding ($card-py/$card-px at Metronic's real 13px
 * root — not the raw rem numbers, which assume 16px).
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md border text-[var(--surface-text-primary)]',
        'border-[var(--card-border-color)] bg-[var(--surface-card-bg)] shadow-[var(--card-shadow)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 px-[29px] py-[26px]', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-sm font-medium text-[var(--surface-text-secondary)]',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-[var(--surface-text-muted)]', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-[29px] pt-0 pb-[26px]', className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center px-[29px] pt-0 pb-[26px]', className)}
      {...props}
    />
  );
}
