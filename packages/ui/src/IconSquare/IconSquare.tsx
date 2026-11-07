import { Slot } from '@radix-ui/react-slot';
import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '../cn';

export type IconSquareSize = 'md' | 'lg';

export interface IconSquareProps extends HTMLAttributes<HTMLDivElement> {
  /** `md`: 40px with a 20px icon. `lg`: 48px with a 24px icon. */
  size?: IconSquareSize;
  /**
   * Draw the square on its only child (a button) instead of a div
   * (Radix Slot).
   */
  asChild?: boolean;
}

const SIZE_CLASSES: Record<IconSquareSize, string> = {
  md: 'p-2.25 rounded-lg [&_svg]:size-5',
  lg: 'p-2.75 rounded-xl [&_svg]:size-6',
};

/**
 * A bordered square around an icon: an empty state's or an error's
 * illustration, an announcement's or a card's leading icon. Neutral by
 * default; a caller's colour pair (`bg-brand-subtle text-brand`) wins. The
 * icon is sized by the square, whatever size it asks for. For a tinted
 * status icon in rings, use `FeaturedIcon`.
 */
export const IconSquare = forwardRef<HTMLDivElement, IconSquareProps>(
  function IconSquare({ size = 'md', asChild, className, ...props }, ref) {
    const Element = asChild ? Slot : 'div';
    return (
      <Element
        ref={ref}
        data-slot="icon-square"
        data-size={size}
        className={cn(
          'border border-secondary bg-transparent leading-[0.9] text-secondary',
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
