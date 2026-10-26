import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '../cn';

/**
 * Returns 1-2 character uppercase acronym/initials from a name or email.
 */
export const getAcronym = (name?: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((item) => item.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Dynamically calculates font size proportionally to avatar size.
 */
export const getPlaceholderFontSize = (size?: string | number): number => {
  const s = typeof size === 'string' ? Number(size.split('px')[0]) : size;
  if (!s) return 12;
  if (s <= 24) return 10;
  if (s <= 32) return 12;
  if (s <= 40) return 14;
  if (s <= 48) return 16;
  if (s <= 56) return 18;
  if (s <= 64) return 20;
  return 24;
};

export const avatarRootVariants = cva(
  'avatar relative flex size-8 shrink-0 items-center justify-center select-none overflow-hidden',
  {
    variants: {
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
      size: {
        xs: 'size-6 text-[10px]',
        sm: 'size-7 text-xs',
        md: 'size-8 text-xs',
        lg: 'size-10 text-sm',
        xl: 'size-12 text-base',
        '2xl': 'size-16 text-lg',
      },
    },
    defaultVariants: {
      shape: 'circle',
      size: 'md',
    },
  },
);

export const avatarFallbackVariants = cva(
  'flex size-full items-center justify-center font-medium leading-none select-none',
  {
    variants: {
      tone: {
        brand: 'bg-brand-600 text-white font-semibold',
        subtle: 'bg-tertiary text-quaternary font-medium',
        primary: 'bg-brand-subtle text-brand font-medium',
        success: 'bg-success-subtle text-success font-medium',
        warning: 'bg-warning-subtle text-warning font-medium',
        danger: 'bg-danger-subtle text-danger font-medium',
      },
    },
    defaultVariants: {
      tone: 'brand',
    },
  },
);

export interface AvatarRootProps
  extends
    React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarRootVariants> {}

export const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarRootProps
>(({ className, shape, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarRootVariants({ shape, size }), className)}
    {...props}
  />
));
AvatarRoot.displayName = 'AvatarRoot';

export interface AvatarImageProps extends React.ComponentProps<
  typeof AvatarPrimitive.Image
> {
  isContain?: boolean;
}

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, isContain, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      'size-full',
      isContain ? 'object-contain' : 'object-cover',
      className,
    )}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

export interface AvatarFallbackProps
  extends
    React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    VariantProps<typeof avatarFallbackVariants> {}

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, tone, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(avatarFallbackVariants({ tone }), className)}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  max?: number;
  totalCount?: number;
  size?: number | string;
}

/**
 * Stacked Avatar Group with overlapping items, automatic overflow badge,
 * and theme-aware surface borders.
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    { className, spacing = 'md', max, totalCount, size, children, ...props },
    ref,
  ) => {
    const spacingClass =
      spacing === 'xs'
        ? '-space-x-1'
        : spacing === 'sm'
          ? '-space-x-1.5'
          : spacing === 'lg'
            ? '-space-x-3'
            : '-space-x-2';

    const childArray = React.Children.toArray(children).filter(Boolean);
    const effectiveTotal = totalCount ?? childArray.length;
    const hasOverflow = max !== undefined && effectiveTotal > max;
    const visibleChildren =
      max !== undefined ? childArray.slice(0, max) : childArray;
    const overflowCount = effectiveTotal - (max ?? 0);

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingClass, className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <span
            key={index}
            className="relative transition-transform hover:z-10 ring-2 ring-[var(--bg-primary)] rounded-full"
          >
            {child}
          </span>
        ))}
        {hasOverflow && (
          <span className="relative transition-transform hover:z-10 ring-2 ring-[var(--bg-primary)] rounded-full">
            <Avatar
              initials={`+${overflowCount}`}
              tone="subtle"
              size={size}
              className="text-base font-medium"
            />
          </span>
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = 'AvatarGroup';

export interface AvatarProps extends Omit<
  React.ComponentProps<typeof AvatarPrimitive.Root>,
  'size'
> {
  src?: string;
  name?: string;
  initials?: string;
  size?: number | string;
  shape?: 'circle' | 'square';
  className?: string;
  fallbackClassName?: string;
  isContain?: boolean;
  alt?: string;
  tone?: 'subtle' | 'brand' | 'primary' | 'success' | 'warning' | 'danger';
  delayMs?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Consolidated canonical Avatar component for Waldur.
 * Composes Radix UI primitives with proportional sizing, shape variants,
 * initials calculation, and graceful image fallback.
 *
 * Sizing:
 * - If `size` prop is provided (number or px string), inline width, height, and
 *   proportional font size are applied.
 * - If omitted, dimensions and font size are controlled by `className` (e.g. `size-9`,
 *   `size-[50px]`) or default to `size="md"` (32px / `size-8 text-xs`).
 *
 * Defaults:
 * - `shape`: defaults to `'circle'`, or `'square'` if `shape="square"`.
 * - `tone`: defaults to `'subtle'` (`bg-tertiary text-quaternary`) when `name` is provided,
 *   or `'brand'` (`bg-brand-600 text-white`) when `initials` is used without `name`.
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      name,
      initials,
      src,
      size,
      className,
      fallbackClassName,
      shape = 'circle',
      isContain = false,
      alt,
      tone,
      delayMs,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedInitials = initials || (name ? getAcronym(name) : '');
    const hasFallbackContent = Boolean(children || resolvedInitials);
    const resolvedTone =
      tone ?? (name ? 'subtle' : resolvedInitials ? 'brand' : undefined);

    const customFallbackClass =
      fallbackClassName || (!hasFallbackContent ? 'bg-transparent' : undefined);
    const sizeValue =
      size !== undefined
        ? typeof size === 'number'
          ? `${size}px`
          : size
        : undefined;

    return (
      <AvatarRoot
        ref={ref}
        shape={shape}
        className={className}
        style={{
          ...(sizeValue ? { width: sizeValue, height: sizeValue } : {}),
          ...(sizeValue
            ? { fontSize: `${getPlaceholderFontSize(sizeValue)}px` }
            : {}),
          ...style,
        }}
        {...props}
      >
        {src && (
          <AvatarImage
            src={src}
            alt={alt || name || resolvedInitials}
            isContain={isContain}
          />
        )}
        <AvatarFallback
          data-testid="avatar-fallback"
          delayMs={delayMs ?? (src ? 600 : undefined)}
          tone={customFallbackClass ? undefined : resolvedTone}
          className={customFallbackClass}
        >
          {children || resolvedInitials}
        </AvatarFallback>
      </AvatarRoot>
    );
  },
);
Avatar.displayName = 'Avatar';
