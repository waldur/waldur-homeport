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
 * (rounded-md, not shadcn's default rounded-xl) and 2rem/2.25rem
 * vertical/horizontal padding ($card-py/$card-px — 26px/29.25px at this
 * app's real 13px root, not the 32px/36px a 16px root would give).
 * Arbitrary rem values, not their px-at-13px-root equivalents: a px value
 * matches only at that one exact root font-size and silently stops
 * matching the real (rem-based) component the moment the page's root
 * font-size changes — a browser zoom, an OS text-size accessibility
 * setting, or simply a different host app (apps/micro-app-poc's own
 * tailwind.css runs at the unmodified 16px root — see its own comment).
 * rem here still resolves correctly in that app: it has no Metronic
 * loaded to force 13px, so 1rem is genuinely 16px there, same as any of
 * its own native Tailwind spacing.
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
      className={cn('flex flex-col gap-1.5 px-[2.25rem] py-[2rem]', className)}
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
      // m-0: Tailwind's preflight zeroes heading margins, but on any page
      // that also loads Bootstrap (e.g. this package rendered inside the
      // main waldur-homeport app or its Storybook), the cascade layer order
      // documented in docs/tailwind-shadcn-migration-notes.md deliberately
      // ranks `bootstrap` above Tailwind's `base` layer — so Bootstrap
      // Reboot's un-layered h1-h6 margin-bottom (0.5rem) wins over preflight
      // and silently reappears here. Found via
      // e2e-visual/stat-card-parity.spec.ts: StatCard rendered 6.5px taller
      // than the real StatsCard specifically because of this leak. An
      // explicit m-0 (Tailwind's `utilities` layer, ranked above
      // `bootstrap`) closes the gap regardless of layer order or which host
      // app renders this.
      className={cn(
        'm-0 text-sm font-medium text-[var(--surface-text-secondary)]',
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
      // m-0: same Bootstrap-Reboot-margin leak as CardTitle above (Reboot
      // also sets <p> margin-bottom: 1rem) — pre-empted here even though no
      // current consumer has hit it yet.
      className={cn('m-0 text-sm text-[var(--surface-text-muted)]', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-[2.25rem] pt-0 pb-[2rem]', className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center px-[2.25rem] pt-0 pb-[2rem]', className)}
      {...props}
    />
  );
}
