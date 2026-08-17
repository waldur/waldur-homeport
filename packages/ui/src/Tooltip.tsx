import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

import { cn } from './cn';

export interface TooltipProps {
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
export const Tooltip = ({
  label,
  body,
  children,
  side = 'top',
  className,
  contentClassName,
}: TooltipProps) => {
  if (!label) return <>{children}</>;

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild className={className}>
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
};
