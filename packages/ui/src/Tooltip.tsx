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
   * Visual theme of the tooltip bubble:
   * - `'dark'` (default): Inverts against the page theme (dark bubble in light mode, light bubble in dark mode).
   * - `'light'`: Stays a fixed dark bubble regardless of the active theme mode.
   */
  theme?: 'light' | 'dark';
  /**
   * Removes the default 200px `max-width` limit, allowing the bubble
   * to size naturally according to its content.
   */
  autoWidth?: boolean;
  /**
   * Optional DOM `id` for the content element (useful for stable testing selectors
   * or external ARIA referencing). Radix handles accessibility IDs automatically.
   */
  id?: string;
  /**
   * Custom `z-index` for the tooltip overlay. Defaults to `1180`.
   * Can be increased (e.g. `9999`) when displayed above high-priority portaled elements.
   */
  zIndex?: number;
  /** Delay in milliseconds before showing the tooltip on hover. Defaults to `200`. */
  delayDuration?: number;
  /**
   * Trigger interaction mode:
   * - `'hover'` (default): Opens on pointer hover and keyboard focus using Radix Tooltip.
   * - `'click'`: Opens on click and dismisses on outside click or Escape using Radix Popover.
   */
  trigger?: 'hover' | 'click';
}

/**
 * Computes style classes for the tooltip bubble.
 * - Uses explicit pixel values for padding and font sizing to preserve scaling with the 13px root.
 * - Uses `drop-shadow` instead of `box-shadow` so the shadow smoothly encapsulates both the bubble and arrow.
 * - Uses `text-[#fff]` instead of `text-white` to prevent Bootstrap's `!important` utility from overriding dark-mode text.
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
    'rounded-lg text-[12px] leading-[17px] drop-shadow-[0_12px_16px_rgba(16,24,40,0.1)]',
    autoWidth ? 'max-w-none' : 'max-w-[200px]',
    hasBody ? 'p-[12px] text-left' : 'px-[12px] py-[8px] text-center',
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
 * Custom tooltip arrow.
 * The polygon base extends 1 unit past y=0 with visible overflow to slightly bleed into
 * the bubble body, preventing sub-pixel anti-aliasing hairline gaps at the seam.
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
 * Accessible Tooltip component backed by Radix UI primitives.
 *
 * Supports hover (Tooltip) and click (Popover) triggers, auto/capped widths,
 * and light/dark theme inversions.
 *
 * Uses `forwardRef` and `Slot` passthrough so it composes transparently inside
 * Radix `asChild` trigger chains (e.g. dropdown triggers or composite buttons).
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
