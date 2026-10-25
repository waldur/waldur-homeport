import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

/**
 * Root container for a sequence of timeline events or steps.
 * Renders an ordered list (<ol>) by default for accessible landmark navigation.
 */
export const TimelineRoot = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<'ol'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ol';
  return (
    <Comp
      ref={ref}
      data-slot="timeline"
      className={cn('relative flex flex-col p-0 m-0 list-none', className)}
      {...props}
    />
  );
});
TimelineRoot.displayName = 'Timeline';

export interface TimelineItemProps extends ComponentPropsWithoutRef<'li'> {
  asChild?: boolean;
  isSelected?: boolean;
}

/**
 * An individual item or step within a Timeline.
 * Renders a list item (<li>) by default with relative positioning and group context.
 */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ asChild, isSelected, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'li';
    return (
      <Comp
        ref={ref}
        data-slot="timeline-item"
        data-selected={isSelected || undefined}
        className={cn('group relative flex items-start', className)}
        {...props}
      />
    );
  },
);
TimelineItem.displayName = 'TimelineItem';

export interface TimelineConnectorProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Line style variant.
   * - 'solid': 2px solid line in `--border-secondary` (default, matches Version History & Comments)
   * - 'dashed': 1px dashed line in `--border-divider-medium` (matches legacy Metronic default)
   * @default 'solid'
   */
  variant?: 'solid' | 'dashed';
}

/**
 * Vertical connecting line between timeline nodes.
 * Automatically omitted on the last item via group-last:hidden.
 */
export const TimelineConnector = forwardRef<
  HTMLDivElement,
  TimelineConnectorProps
>(({ variant = 'solid', className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    data-slot="timeline-connector"
    className={cn(
      'absolute left-4 top-4 -bottom-4 w-0 -translate-x-1/2 group-last:hidden pointer-events-none z-0',
      variant === 'dashed'
        ? 'border-l border-dashed border-divider-medium'
        : 'border-l-2 border-secondary',
      className,
    )}
    {...props}
  />
));
TimelineConnector.displayName = 'TimelineConnector';

/**
 * Marker container for avatars, badges, or icons.
 */
export const TimelineIcon = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      data-slot="timeline-icon"
      className={cn(
        'relative z-10 shrink-0 mr-4 flex items-center justify-center',
        className,
      )}
      {...props}
    />
  );
});
TimelineIcon.displayName = 'TimelineIcon';

/**
 * Body content for a timeline item.
 */
export const TimelineContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<'div'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      data-slot="timeline-content"
      className={cn('flex-1 min-w-0 pb-3', className)}
      {...props}
    />
  );
});
TimelineContent.displayName = 'TimelineContent';

export { TimelineRoot as Timeline };
