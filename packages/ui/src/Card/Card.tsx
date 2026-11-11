import { Slot } from '@radix-ui/react-slot';
import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '../cn';

/**
 * shadcn's Card recipe (Card/CardHeader/CardTitle/CardToolbar/CardContent/
 * CardFooter as composable div wrappers — see
 * https://ui.shadcn.com/docs/components/card) drawn exactly as HomePort's
 * Metronic `.card` was: Bootstrap's `card` partial, Metronic's
 * `components/_card.scss` and the `.card .card-header` rule of
 * `legacy/_base.scss`, merged.
 *
 * - Card: a flex column, `--bg-primary`, 8px radius. Light: no border, the
 *   `--card-shadow`; dark: a 1px `--border-secondary` border, no shadow.
 *   `bordered` draws the border in both themes, without the shadow.
 * - CardHeader: a 70px-high wrapping flex row, inset by the card's
 *   horizontal padding (a margin, so its bottom rule stops short of the
 *   edges), 14px bold `--text-secondary` text.
 * - CardTitle: 1.275rem medium `--text-primary`, 0.5rem margins but none
 *   on the left.
 * - CardToolbar: a wrapping flex row with 0.5rem vertical margins.
 * - CardContent, CardFooter: `--card-padding-y` / `--card-padding-x`; the
 *   footer has a top rule and is a block, not a flex row.
 *
 * Each part sets `data-slot` (`card`, `card-header`, `card-title`,
 * `card-toolbar`, `card-content`, `card-footer`). A rule that restyles a
 * part by where it sits sets one of the non-inheriting `--card-*` hooks
 * (registered in waldur-design-tokens' card.css), which the part reads
 * with its own value as the fallback, so a utility the caller passes still
 * wins. The `solid`, `widget` and `sm` variants are such rules, in
 * card.css; HomePort's stylesheets (src/styles/legacy) add the table card
 * and cards in an expanded table row or a tab panel.
 *
 * Sizes stay in rem, as Metronic's were, so they follow the 13px root.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Outline the card with a `--border-secondary` border instead of the
   * theme-dependent shadow, in both themes (Metronic `.card-bordered`).
   */
  bordered?: boolean;
  /**
   * `data-variant`:
   * - `solid`: the header is a full-width `--bg-secondary` strip, 48px high.
   * - `widget`: a dashboard widget; its bodies have 20px padding.
   * - `table`: HomePort's table card (`@/table`): a 77px header, no top
   *   padding in the body, and no border unless `bordered`.
   */
  variant?: 'solid' | 'table' | 'widget';
  /**
   * `sm`: the compact card, with a 36px header and 16px insets
   * (`data-size`).
   */
  size?: 'sm';
  /**
   * Draw the card on its only child (a link, a form) instead of a div
   * (Radix Slot), the way `.card` went on any element.
   */
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, bordered, variant, size, asChild, ...props },
  ref,
) {
  const Element = asChild ? Slot : 'div';
  return (
    <Element
      ref={ref}
      data-slot="card"
      data-variant={variant}
      data-size={size}
      data-bordered={bordered ? '' : undefined}
      className={cn(
        'relative flex min-w-[var(--card-min-width,0px)] flex-col break-words bg-[var(--card-surface-bg,var(--bg-primary))] bg-clip-border',
        'rounded-[var(--card-radius,var(--radius-lg))] border-solid border-secondary',
        bordered
          ? 'border-[length:var(--card-border-width,1px)] shadow-[var(--card-box-shadow,none)]'
          : 'border-[length:var(--card-border-width,var(--card-edge-width))] shadow-[var(--card-box-shadow,var(--card-shadow))]',
        className,
      )}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        'flex flex-wrap items-center justify-between',
        'min-h-[var(--card-header-min-h,var(--card-header-min-height,70px))]',
        'mx-[var(--card-header-mx,var(--card-padding-x))] px-[var(--card-header-px,0px)] py-[var(--card-header-padding-y,var(--card-header-py))]',
        'border-b border-secondary bg-[var(--card-header-bg,transparent)] first:rounded-t-[7px]',
        'text-[length:var(--text-sm)] font-bold text-[color:var(--card-header-color,var(--text-secondary))]',
        className,
      )}
      {...props}
    />
  );
});

type TitleElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * - `md` (default): `.card-title` set directly on the heading
   *   (1.275rem, medium).
   * - `lg`: 1.385rem semibold, Bootstrap's `$h3-font-size` at 1200px and
   *   up. Not the same as an `<h3>` inside a title (`<CardTitle as="div">
   *   <h3>…`), which takes the reboot's responsive h3 size,
   *   `calc(1.2635rem + 0.162vw)` below 1200px.
   */
  size?: 'md' | 'lg';
  /**
   * The element to render, `h3` by default. Any other element keeps its
   * own line height (a heading's 1.2 from the reboot, a `div`'s the
   * page's), as the `.card-title` it replaces did.
   */
  as?: TitleElement;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle(
    { className, children, size = 'md', as: Element = 'h3', ...props },
    ref,
  ) {
    return (
      <Element
        ref={ref}
        data-slot="card-title"
        className={cn(
          'my-[var(--card-title-my,var(--card-header-py))] mr-[var(--card-title-mr,var(--card-header-py))] ml-0 flex items-center text-primary',
          Element === 'h3' && 'leading-[1.2]',
          size === 'lg'
            ? // eslint-disable-next-line waldur-custom/require-font-size-scale -- matches Metronic's rem .card-title until the card step moves both to the scale
              'text-[1.385rem] font-semibold'
            : // eslint-disable-next-line waldur-custom/require-font-size-scale -- as above
              'text-[1.275rem] font-medium',
          className,
        )}
        {...props}
      >
        {children}
      </Element>
    );
  },
);

/** The header's actions: a wrapping flex row (Metronic `.card-toolbar`). */
export const CardToolbar = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardToolbar({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-toolbar"
      className={cn(
        'my-[var(--card-toolbar-my,var(--card-header-py))] flex flex-wrap items-center',
        className,
      )}
      {...props}
    />
  );
});

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn(
        'm-0 text-[length:var(--card-description-font-size)] font-normal text-quaternary',
        className,
      )}
      {...props}
    />
  );
});

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn(
        'flex-[var(--card-content-flex,1_1_auto)] px-[var(--card-content-px,var(--card-padding-x))]',
        'pt-[var(--card-content-pt,var(--card-padding-y))] pb-[var(--card-content-pb,var(--card-padding-y))]',
        className,
      )}
      {...props}
    />
  );
});

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        'px-[var(--card-padding-x)] py-[var(--card-padding-y)] border-t border-secondary bg-transparent last:rounded-b-[7px]',
        className,
      )}
      {...props}
    />
  );
});
