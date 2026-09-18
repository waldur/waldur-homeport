import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';
import { Tooltip, type TooltipProps } from './Tooltip';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'blue'
  | 'indigo'
  | 'moss'
  | 'pink'
  | 'teal'
  | 'orange'
  | 'rose';

export type BadgeTone = 'solid' | 'light' | 'outline';
export type BadgeShape = 'rounded' | 'pill' | 'circle' | 'roundless';

/**
 * Replaces badgeColors.css completely.
 * Maps 15 Variants × 3 Tones directly to Tailwind classes.
 * Dark mode handles exact overrides (e.g. `dark:bg-brand-950`).
 *
 * Note: `solid` and `light` tones use `border-transparent` because
 * the `border-[1px]` is structural. Visually, a transparent border
 * over a background color is identical to setting `border-color: same-as-bg`.
 */
export const BADGE_STYLES: Record<BadgeVariant, Record<BadgeTone, string>> = {
  primary: {
    solid: 'border-transparent bg-brand-600 text-white dark:bg-brand-600',
    light:
      'border-transparent bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
    outline:
      'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900 dark:border-brand-700 dark:text-brand-200',
  },
  secondary: {
    solid:
      'border-transparent bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    light:
      'border-transparent bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
    outline:
      'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900 dark:border-brand-700 dark:text-brand-200',
  },
  success: {
    solid: 'border-transparent bg-success-600 text-white dark:bg-success-500',
    light:
      'border-transparent bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-400',
    outline:
      'bg-success-50 border-success-200 text-success-700 dark:bg-success-900 dark:border-success-700 dark:text-success-200',
  },
  warning: {
    solid: 'border-transparent bg-warning-600 text-white dark:bg-warning-500',
    light:
      'border-transparent bg-warning-50 text-warning-600 dark:bg-warning-950 dark:text-warning-400',
    outline:
      'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-900 dark:border-warning-700 dark:text-warning-200',
  },
  danger: {
    solid: 'border-transparent bg-error-600 text-white dark:bg-error-500',
    light:
      'border-transparent bg-error-50 text-error-600 dark:bg-error-950 dark:text-error-400',
    outline:
      'bg-error-50 border-error-200 text-error-700 dark:bg-error-900 dark:border-error-700 dark:text-error-200',
  },
  info: {
    solid: 'border-transparent bg-info-600 text-white dark:bg-info-300',
    light:
      'border-transparent bg-info-50 text-info-600 dark:bg-info-900 dark:text-info-300',
    outline:
      'bg-info-50 border-info-200 text-info-700 dark:bg-info-900 dark:border-info-700 dark:text-info-200',
  },
  neutral: {
    solid: 'border-transparent bg-gray-600 text-white dark:bg-gray-400',
    light:
      'border-transparent bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    outline:
      'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300',
  },
  purple: {
    solid: 'border-transparent bg-purple-500 text-white dark:bg-purple-400',
    light:
      'border-transparent bg-purple-50 text-purple-500 dark:bg-purple-950 dark:text-purple-400',
    outline:
      'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
  },
  blue: {
    solid: 'border-transparent bg-blue-500 text-white dark:bg-blue-400',
    light:
      'border-transparent bg-blue-50 text-blue-500 dark:bg-blue-950 dark:text-blue-400',
    outline:
      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  },
  indigo: {
    solid: 'border-transparent bg-indigo-500 text-white dark:bg-indigo-400',
    light:
      'border-transparent bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400',
    outline:
      'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200',
  },
  moss: {
    solid: 'border-transparent bg-moss-500 text-white dark:bg-moss-400',
    light:
      'border-transparent bg-moss-50 text-moss-500 dark:bg-moss-950 dark:text-moss-400',
    outline:
      'bg-moss-50 border-moss-200 text-moss-700 dark:bg-moss-900 dark:border-moss-700 dark:text-moss-200',
  },
  pink: {
    solid: 'border-transparent bg-pink-500 text-white dark:bg-pink-400',
    light:
      'border-transparent bg-pink-50 text-pink-500 dark:bg-pink-950 dark:text-pink-400',
    outline:
      'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-200',
  },
  teal: {
    solid: 'border-transparent bg-teal-500 text-white dark:bg-teal-400',
    light:
      'border-transparent bg-teal-50 text-teal-500 dark:bg-teal-950 dark:text-teal-400',
    outline:
      'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-200',
  },
  orange: {
    solid: 'border-transparent bg-orange-500 text-white dark:bg-orange-400',
    light:
      'border-transparent bg-orange-50 text-orange-500 dark:bg-orange-950 dark:text-orange-400',
    outline:
      'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200',
  },
  rose: {
    solid: 'border-transparent bg-rose-500 text-white dark:bg-rose-400',
    light:
      'border-transparent bg-rose-50 text-rose-500 dark:bg-rose-950 dark:text-rose-400',
    outline:
      'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900 dark:border-rose-700 dark:text-rose-200',
  },
};

// CVA only handles structural layout variants now.
const badgeVariants = cva(
  'badge inline-flex items-center justify-center border-[1px] text-[1.075rem] leading-[20px] font-medium transition-colors',
  {
    variants: {
      size: {
        sm: 'text-[0.85rem]',
        lg: 'text-[1rem]',
      },
      shape: {
        rounded: 'rounded-lg',
        pill: 'rounded-full',
        circle: 'rounded-full aspect-square justify-center size-6 min-w-6 p-0',
        roundless: 'rounded-none',
      },
      onlyIcon: {
        true: 'aspect-square justify-center size-6 min-w-6 leading-none p-0',
        false: 'py-[1px] px-[9px]',
      },
    },
    defaultVariants: {
      shape: 'rounded',
      onlyIcon: false,
    },
    compoundVariants: [
      {
        onlyIcon: false,
        size: 'sm',
        class: 'px-[8px] py-[2px]',
      },
      {
        onlyIcon: false,
        size: 'lg',
        class: 'px-[12px] py-[5px]',
      },
      {
        shape: 'circle',
        size: 'sm',
        class: 'size-5 min-w-5 text-[0.75rem] p-0',
      },
      {
        shape: 'circle',
        size: 'lg',
        class: 'size-7 min-w-7 text-[0.95rem] p-0',
      },
      {
        onlyIcon: true,
        size: 'sm',
        class: 'size-5 min-w-5 text-[0.75rem] p-0',
      },
      {
        onlyIcon: true,
        size: 'lg',
        class: 'size-7 min-w-7 text-[0.95rem] p-0',
      },
    ],
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  shape?: BadgeShape;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onlyIcon?: boolean;
  alignIcon?: boolean;
  hasBullet?: boolean;
  tooltip?: ReactNode;
  tooltipProps?: Partial<TooltipProps>;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'primary',
      tone = 'solid',
      shape = 'rounded',
      size,
      leftIcon,
      rightIcon,
      onlyIcon,
      alignIcon,
      hasBullet,
      tooltip,
      tooltipProps,
      children,
      ...props
    },
    ref,
  ) => {
    void alignIcon;

    const hasContent =
      children !== undefined &&
      children !== null &&
      children !== false &&
      (typeof children !== 'string' || children.trim().length > 0);

    const badgeElement = (
      <span
        ref={ref}
        data-variant={variant}
        data-tone={tone}
        className={cn(
          badgeVariants({ size, shape, onlyIcon }),
          BADGE_STYLES[variant][tone],
          className,
        )}
        {...props}
      >
        {hasBullet && (
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
        )}
        {Boolean(leftIcon) && (
          <span
            className={cn(
              'left-icon inline-flex shrink-0 items-center justify-center',
              hasContent && 'mr-1',
            )}
            data-testid="badge-left-icon"
          >
            {leftIcon}
          </span>
        )}
        {children}
        {Boolean(rightIcon) && (
          <span
            className={cn(
              'right-icon inline-flex shrink-0 items-center justify-center',
              hasContent && 'ml-1',
            )}
            data-testid="badge-right-icon"
          >
            {rightIcon}
          </span>
        )}
      </span>
    );

    if (tooltip) {
      return (
        <Tooltip label={tooltip} {...tooltipProps}>
          {badgeElement}
        </Tooltip>
      );
    }

    return badgeElement;
  },
);

Badge.displayName = 'Badge';
