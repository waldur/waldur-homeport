import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

import { cn } from './cn';

export interface TooltipProps extends Omit<
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>,
  'asChild' | 'children'
> {
  label: ReactNode;
  body?: ReactNode;
  children: ReactNode;
  side?: TooltipPrimitive.TooltipContentProps['side'];
  className?: string;
  contentClassName?: string;
  /**
   * 'dark' (default) matches src/core/Tooltip.tsx's Tip default: applies
   * Tip's own `.tooltip-dark` class, whose bg/arrow color is Metronic's
   * $dark token — literally `$dark: $gray-900`, and
   * src/metronic/sass/_colors.scss defines `$gray-900` itself as
   * `if(isDarkMode(), #f5f5f6, #101828)`. So despite the name, 'dark'
   * *inverts* with the app's own light/dark theme: a near-black bubble on
   * a light-mode page, a near-white one on a dark-mode page — confirmed
   * against the real app (a dark-mode screenshot of an unrelated,
   * still-untouched Tip tooltip came back light-on-dark). Ports as
   * Tailwind's dark: variant here since, unlike Metronic's build-time SCSS
   * swap, this file's --color-gray-900/--color-gray-50 tokens don't invert
   * their own meaning between themes.
   * 'light' matches Tip's *only* other real call site (CallCard.tsx):
   * applies class `tooltip-light`, which has no matching rule in
   * _tooltip.scss at all, so it falls through to Bootstrap's own
   * $tooltip-bg/$tooltip-color (_variables.custom.scss's
   * $bg-primary-solid/$text-primary_on-brand). Those resolve via
   * `if(isDarkMode(), $gray-50, $gray-900)` — since $gray-50 and $gray-900
   * are *themselves* swapped between the light/dark stylesheet builds (see
   * above), that double inversion cancels out: both branches land on a
   * near-black solid color, so 'light' is, confusingly, the one that
   * stays a fixed dark bubble regardless of app theme.
   */
  theme?: 'light' | 'dark';
  /** Removes the 200px max-width cap, letting the bubble size to its
   * content instead of wrapping — Tip's own autoWidth prop
   * (.tooltip-auto-width sets max-width: inherit). Widely used on the Tip
   * side (10+ call sites), unlike most of the other props below. */
  autoWidth?: boolean;
  /** DOM id on the content element. Tip's own `id` is a *required* prop
   * there because react-bootstrap's OverlayTrigger needs it to wire
   * aria-describedby by hand; Radix's Tooltip/Popover do that internally
   * regardless, so this is optional here — only for a consumer that
   * additionally needs a stable selector (e2e tests, an external
   * aria-labelledby). */
  id?: string;
  /** Overrides the default 1180 (src/tailwind.css's --z-index-tooltip,
   * kept in sync with this literal by hand — see that variable's own
   * comment on why it isn't consumed as a class here) — needed when the
   * tooltip must sit above a portaled react-select menu (z-index 9999),
   * same as Tip's own zIndex prop and for the same reason. A plain inline
   * style, not a Tailwind class: Tailwind can't generate an
   * arbitrary-value utility for a value only known at runtime. */
  zIndex?: number;
  /** Hover delay before showing, ms. Tip has no equivalent (react-bootstrap
   * defaults to a 0/immediate show); this project's own Tip callers never
   * asked for one either, so this only exists to make the previously
   * hardcoded 200ms configurable rather than to port a Tip feature. */
  delayDuration?: number;
  /**
   * 'hover' (default): standard Radix Tooltip hover/focus behavior, same
   * as Tip's own default. 'click': renders as a Radix Popover instead of a
   * Tooltip — Radix's Tooltip primitive has no built-in click-only mode
   * (its Trigger keeps responding to hover/focus internally regardless of
   * any `open` state you control), and Popover is Radix's own recommended
   * primitive for click-triggered, dismissible content. Reuses this
   * component's own tooltip-bubble styling rather than Popover.tsx's card
   * styling, since visually this is still meant to read as a tooltip, just
   * click-triggered — matching Tip's real trigger="click" usage
   * (OpenStackInstanceVolumeBadge.tsx). Popover's own default
   * dismiss-on-outside-click/Escape behavior is what Tip's separate
   * `rootClose` prop opts into by hand; here it comes for free with
   * trigger="click", so there's no separate prop for it.
   */
  trigger?: 'hover' | 'click';
}

/**
 * Tailwind/Radix counterpart to src/core/Tooltip.tsx's Tip (react-bootstrap
 * OverlayTrigger) — built for visual parity with it, not just a generic
 * shadcn tooltip. Every value below (bg/text colors, padding, radius,
 * shadow, arrow size, max-width, font-size/line-height) was extracted via
 * getComputedStyle() on the real Tip in Storybook, the same cross-check
 * methodology used for BaseButtonTw's own tokens — see
 * docs/tailwind-shadcn-migration-notes.md. Font-size/line-height/arrow use
 * px arbitrary values rather than Tailwind's rem-based scale for the same
 * reason BaseButtonTw does: Metronic forces a 13px root font-size, which
 * would silently resize any rem-based class.
 *
 * Covers Tip's fuller react-bootstrap-derived API now (theme, autoWidth,
 * id, zIndex, delayDuration, trigger="click") — placement/container/
 * rootClose stay unreplicated: placement's Tip variants beyond the plain
 * four sides (top-start etc.) and container have no current call site at
 * all, and rootClose is subsumed by trigger="click" above.
 */
const contentClassName = ({
  theme,
  autoWidth,
  hasBody,
  className,
}: {
  theme: 'light' | 'dark';
  autoWidth: boolean | undefined;
  hasBody: boolean;
  className: string | undefined;
}) =>
  cn(
    // px-[12px]/py-[8px] etc, not p-3/py-2: Tailwind's numbered
    // spacing scale doesn't pick up this file's --spacing
    // override reliably (measured 9.75px for p-3 instead of the
    // expected 12px) — same reason BaseButtonTw itself uses only
    // px arbitrary values for padding, never the numbered scale.
    //
    // drop-shadow-[...] (filter), not shadow-[...] (box-shadow): the Arrow
    // below is a descendant SVG that protrudes past this rounded rect's own
    // box, so a box-shadow — clipped to that box — stops dead at the edge
    // and leaves a visible seam where the arrow meets the body. A
    // drop-shadow filter wraps the whole rendered shape, body and arrow
    // together, so it reads as one bubble. (No spread-radius equivalent
    // exists for drop-shadow, so the -4px spread from the original
    // box-shadow value is dropped — visually negligible at this size.)
    'rounded-lg text-[12px] leading-[17px] drop-shadow-[0_12px_16px_rgba(16,24,40,0.1)]',
    autoWidth ? 'max-w-none' : 'max-w-[200px]',
    hasBody ? 'p-[12px] text-left' : 'px-[12px] py-[8px] text-center',
    // See TooltipProps.theme's own comment on why 'dark' (not 'light') is
    // the one that inverts with the app's own theme.
    //
    // text-[#fff], not Tailwind's text-white: Bootstrap ships its own
    // `.text-white { color: ... !important }` utility under the exact same
    // class name, and !important always beats our non-important dark:
    // override regardless of cascade-layer order — so the label rendered
    // permanently white, even in dark mode where dark:text-[...] should
    // have taken over. An arbitrary-value class sidesteps the name clash.
    theme === 'dark'
      ? 'bg-[var(--color-gray-900)] text-[#fff] dark:bg-[var(--color-gray-50)] dark:text-[var(--color-gray-900)]'
      : 'bg-[var(--color-gray-900)] text-[#fff]',
    className,
  );

const arrowClassName = (theme: 'light' | 'dark') =>
  theme === 'dark'
    ? 'fill-[var(--color-gray-900)] dark:fill-[var(--color-gray-50)]'
    : 'fill-[var(--color-gray-900)]';

/**
 * Radix's own Arrow renders a polygon whose flat base sits exactly flush
 * with Content's edge (touching, zero overlap) — even with matching fill
 * colors and no gap, that exact edge-to-edge seam is prone to a visible
 * hairline from sub-pixel anti-aliasing (the two shapes are painted by
 * separate rasterizers — SVG vs the HTML box — that don't anti-alias
 * toward each other). Rendering our own polygon via asChild, with the base
 * extended 1 viewBox unit (~0.5px at this size) past y=0 and the SVG's own
 * overflow left visible, lets the base bleed slightly into Content instead
 * of just touching it. Overflow, not a wider viewBox, is what makes this
 * actually paint past the box's edge — widening the viewBox only relabels
 * the coordinate space, it doesn't change what's visible. Kept to 1 unit
 * (not more) since the resulting ~0.5px growth past Bootstrap's own
 * tooltip-arrow size ($tooltip-arrow-height: .4rem ≈ 5.2px at this app's
 * 13px root) is the minimum that still hides the seam.
 */
const bubbleArrow = (theme: 'light' | 'dark') => (
  <svg
    viewBox="0 0 30 10"
    preserveAspectRatio="none"
    width={10}
    height={5}
    style={{ overflow: 'visible', display: 'block' }}
    className={arrowClassName(theme)}
  >
    <polygon points="0,-1 30,-1 15,10" />
  </svg>
);

const bubbleChildren = (label: ReactNode, body: ReactNode) => (
  <>
    <div className="font-medium">{label}</div>
    {body && (
      <div className="mt-[4px] font-normal text-[var(--color-gray-300)]">
        {body}
      </div>
    )}
  </>
);

/**
 * forwardRef and the `...rest` passthrough exist so this composes inside a
 * Radix `asChild` chain, e.g. a DropdownMenuTrigger wrapping a tooltipped
 * button:
 *
 *   <DropdownMenuTrigger asChild><BaseButton tooltip="…" /></DropdownMenuTrigger>
 *
 * Slot clones its *immediate* child — here this component, not the button
 * underneath — so the ref and the trigger props (aria-haspopup,
 * aria-expanded, data-state, the pointer/keyboard handlers) land on
 * Tooltip and have to be relayed onward. TooltipPrimitive.Trigger is
 * already `asChild`, so anything given to it is merged onto the real
 * element; without this relay the outer trigger silently does nothing.
 *
 * The no-label early return uses Slot rather than a bare fragment for the
 * same reason: a fragment cannot take a ref or props, so an optional
 * tooltip would otherwise break composition exactly when it is absent.
 */
export const Tooltip = forwardRef<HTMLButtonElement, TooltipProps>(
  (
    {
      label,
      body,
      children,
      side = 'top',
      className,
      contentClassName: contentClassNameProp,
      theme = 'dark',
      autoWidth,
      id,
      zIndex = 1180,
      delayDuration = 200,
      trigger = 'hover',
      ...rest
    },
    ref,
  ) => {
    if (!label)
      return (
        <Slot ref={ref} className={className} {...rest}>
          {children}
        </Slot>
      );

    const bubbleClassName = contentClassName({
      theme,
      autoWidth,
      hasBody: !!body,
      className: contentClassNameProp,
    });

    if (trigger === 'click') {
      return (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger
            asChild
            ref={ref}
            className={className}
            {...rest}
          >
            {children}
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              id={id}
              side={side}
              sideOffset={8}
              style={{ zIndex }}
              className={bubbleClassName}
            >
              {bubbleChildren(label, body)}
              <PopoverPrimitive.Arrow asChild>
                {bubbleArrow(theme)}
              </PopoverPrimitive.Arrow>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      );
    }

    return (
      <TooltipPrimitive.Provider delayDuration={delayDuration}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger
            asChild
            ref={ref}
            className={className}
            {...rest}
          >
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              id={id}
              side={side}
              sideOffset={8}
              style={{ zIndex }}
              className={bubbleClassName}
            >
              {bubbleChildren(label, body)}
              <TooltipPrimitive.Arrow asChild>
                {bubbleArrow(theme)}
              </TooltipPrimitive.Arrow>
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
Tooltip.displayName = 'Tooltip';
