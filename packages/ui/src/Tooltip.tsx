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
 * Scoped to Tip's actual current usage (label + optional body, default
 * hover/focus trigger, no theme/trigger/container/rootClose props) — Tip's
 * fuller react-bootstrap-derived API isn't replicated because nothing in
 * packages/ui needs it yet.
 */
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
      contentClassName,
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

    return (
      <TooltipPrimitive.Provider delayDuration={200}>
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
              side={side}
              sideOffset={8}
              className={cn(
                // px-[12px]/py-[8px] etc, not p-3/py-2: Tailwind's numbered
                // spacing scale doesn't pick up this file's --spacing
                // override reliably (measured 9.75px for p-3 instead of the
                // expected 12px) — same reason BaseButtonTw itself uses only
                // px arbitrary values for padding, never the numbered scale.
                'z-[1180] max-w-[200px] rounded-lg bg-[var(--color-gray-900)] text-[12px] leading-[17px] text-white shadow-[0_12px_16px_-4px_rgba(16,24,40,0.1)]',
                body ? 'p-[12px] text-left' : 'px-[12px] py-[8px] text-center',
                contentClassName,
              )}
            >
              <div className="font-medium">{label}</div>
              {body && (
                <div className="mt-[4px] font-normal text-[var(--color-gray-300)]">
                  {body}
                </div>
              )}
              <TooltipPrimitive.Arrow
                width={10}
                height={5}
                className="fill-[var(--color-gray-900)]"
              />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  },
);
Tooltip.displayName = 'Tooltip';
