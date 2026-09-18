import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';
import {
  FeaturedIcon,
  FeaturedIconSize,
  FeaturedIconVariant,
} from './FeaturedIcon';

export type AlertItemVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertItemType = 'full-width' | 'floating';

export interface AlertItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: ReactNode;
  titleAfter?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  variant?: AlertItemVariant;
  type?: AlertItemType;
  className?: string;
  /** FeaturedIcon size. Defaults to 'lg' (42px), the full-row look. */
  iconSize?: FeaturedIconSize;
  /** Extra classes for the icon, e.g. to override its default vertical offset. */
  iconClassName?: string;
}

const ALERT_ICON: Record<
  AlertItemVariant,
  { icon: ReactNode; variant: FeaturedIconVariant }
> = {
  info: { icon: <InfoIcon weight="bold" />, variant: 'neutral' },
  success: { icon: <CheckCircleIcon weight="bold" />, variant: 'success' },
  warning: { icon: <WarningCircleIcon weight="bold" />, variant: 'warning' },
  error: { icon: <WarningOctagonIcon weight="bold" />, variant: 'danger' },
};

/**
 * AlertItem — notification / message row component ported from the legacy
 * Bootstrap/Metronic `src/core/AlertItem.tsx`.
 *
 * Real values (root font-size is 13px in Metronic, expressed below as arbitrary
 * rem/px values matching design tokens and computed measurements):
 * - `full-width`: py-[1.23rem] px-0 (15.99px vertical padding) with a 1px border-bottom
 * - `floating`: p-[1.23rem] (15.99px padding all around), rounded-[0.475rem] (6.175px radius), full border
 * - Border color: var(--surface-card-border) (#E4E7EC light / #1F242F dark)
 * - Row gap: gap-[0.846rem] (10.998px)
 * - Icon: FeaturedIcon size="lg" by default (42px outer ring, 32px inner, 24px icon)
 *   with -mt-[0.77rem] (-10.01px); `iconSize`/`iconClassName` let a caller
 *   (e.g. Toast, which uses the smaller 'md' default) override either.
 * - Title: text-sm (14px) font-medium (500) leading-[20px] text-[var(--surface-text-primary)]
 * - Body: text-sm (14px) font-normal (400) leading-[20px] text-[var(--surface-text-secondary)]
 * - Actions: flex items-start pr-[2px] gap-[12px]
 */
export const AlertItem = forwardRef<HTMLDivElement, AlertItemProps>(
  (
    {
      title,
      titleAfter,
      body,
      actions,
      variant = 'info',
      type = 'full-width',
      className,
      iconSize = 'lg',
      iconClassName,
      ...props
    },
    ref,
  ) => {
    const isFloating = type === 'floating';

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-[0.846rem]',
          isFloating
            ? 'p-[1.23rem] rounded-[0.475rem] border border-[var(--surface-card-border)]'
            : 'py-[1.23rem] px-0 border-b border-[var(--surface-card-border)]',
          className,
        )}
        {...props}
      >
        <FeaturedIcon
          icon={ALERT_ICON[variant].icon}
          size={iconSize}
          variant={ALERT_ICON[variant].variant}
          data-testid="alert-featured-icon"
          className={cn('-mt-[0.77rem]', iconClassName)}
        />
        <div className="grow">
          <div className="flex items-center flex-wrap gap-[0.616rem] mb-[0.308rem]">
            <h6 className="m-0 text-[1.077rem] font-medium leading-[1.43] text-[var(--surface-text-primary)]">
              {title}
            </h6>
            {titleAfter}
          </div>
          {Boolean(body) && (
            <div className="text-[1.077rem] font-normal leading-[1.43] text-[var(--surface-text-secondary)]">
              {body}
            </div>
          )}
        </div>
        {Boolean(actions) && (
          <div className="flex items-start pr-[2px] gap-[0.924rem]">
            {actions}
          </div>
        )}
      </div>
    );
  },
);

AlertItem.displayName = 'AlertItem';
