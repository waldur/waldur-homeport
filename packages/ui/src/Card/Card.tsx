import { HTMLAttributes } from 'react';

import { cn } from '../cn';

/**
 * shadcn's Card recipe (Card/CardHeader/CardTitle/CardDescription/
 * CardContent/CardFooter as composable div wrappers — see
 * https://ui.shadcn.com/docs/components/card) aligned to the live Metronic
 * `.card` design system.
 *
 * Source of truth:
 * - Spacing tokens `--card-padding-x: 1.85rem` ($card-px) and
 *   `--card-padding-y: 1.23rem` ($card-py) defined in
 *   `src/styles/bootstrap/_variables.scss` and declared in
 *   `packages/design-tokens/src/css/components/card.css`.
 * - Header min-height `--card-header-min-height: 70px` from
 *   `src/styles/bootstrap/_variables.scss`.
 * - Surface colors & shadow: `--card-bg`, `--card-shadow`, and
 *   `--card-border-color` from `packages/design-tokens/src/css/components/card.css`.
 * - Radius: 8px (`rounded-lg`, from `$card-border-radius: $border-radius` = 8px
 *   / `--radius-lg`).
 *
 * Header geometry in Metronic (`_base.scss` and `_card.scss`):
 * - `.card-header` sits inside the card with horizontal margin `mx-[var(--card-padding-x,1.85rem)]`
 *   and vertical padding `py-[0.5rem]`, so its bottom border spans between the margins.
 *   Flex layout with `items-center justify-between flex-wrap min-h-[var(--card-header-min-height,70px)]`.
 * - `.card-title` is `text-[1.275rem] font-medium leading-[1.2] text-primary`
 *   with `my-[0.5rem] mr-[0.5rem] ml-0 flex items-center`.
 * - `.card-body` (CardContent) has `px-[var(--card-padding-x,1.85rem)] py-[var(--card-padding-y,1.23rem)]`.
 *   Unlike default shadcn, there is no `pt-0` in Metronic.
 * - `.card-footer` has `px-[var(--card-padding-x,1.85rem)] py-[var(--card-padding-y,1.23rem)]`,
 *   `border-t border-secondary bg-transparent flex items-center`.
 *
 * Preserved in rem so responsive scaling (13px root font-size in Homeport)
 * remains exact and adapts across root font changes.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border-[1px] text-primary',
        'border-[var(--card-border-color)] bg-[var(--card-bg)] shadow-[var(--card-shadow)]',
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
      className={cn(
        'flex items-center justify-between flex-wrap min-h-[var(--card-header-min-height,70px)]',
        'mx-[var(--card-padding-x,1.85rem)] py-[0.5rem] border-b border-secondary bg-transparent',
        className,
      )}
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
        'my-[0.5rem] mr-[0.5rem] ml-0 flex items-center text-[1.275rem] leading-[1.2] font-medium text-primary',
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
      className={cn('m-0 text-[1rem] text-quaternary', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-[var(--card-padding-x,1.85rem)] py-[var(--card-padding-y,1.23rem)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center px-[var(--card-padding-x,1.85rem)] py-[var(--card-padding-y,1.23rem)] border-t border-secondary bg-transparent',
        className,
      )}
      {...props}
    />
  );
}
