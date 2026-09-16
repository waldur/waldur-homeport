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
        className={cn(badgeVariants({ size, shape, onlyIcon }), className)}
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
