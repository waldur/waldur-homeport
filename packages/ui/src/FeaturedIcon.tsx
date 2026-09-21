import { CSSProperties, forwardRef, HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

export type FeaturedIconVariant =
  'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type FeaturedIconTone = 'outline' | 'solid';

export type FeaturedIconSize = 'sm' | 'md' | 'lg' | 'xl';

// Metronic's real px values (_icon.scss), kept in one place rather than
// re-derived per render. `solid` sizes the *outer* ring, not `outer` —
// Metronic's `.featured-icon-solid` is a few px larger than the outline
// tone at the same `size` so the flat fill reads as generously padded
// around the same inner icon, not just a border removed.
const OUTER_SIZE = { sm: 34, md: 38, lg: 42, xl: 46 };
const SOLID_SIZE = { sm: 32, md: 40, lg: 48, xl: 56 };
const INNER_SIZE = { sm: 24, md: 28, lg: 32, xl: 36 };
const ICON_SIZE = { sm: 16, md: 20, lg: 24, xl: 28 };

/**
 * Maps the variant to Tailwind utilities.
 * We map the foreground (fg) and solid background (bg).
 * Note: Because the design uses irregular ramp steps for the solid background
 * (e.g., info-50 instead of 100, gray-800 instead of 950), a JS dictionary is best here.
 */
const VARIANT_STYLES: Record<FeaturedIconVariant, { fg: string; bg: string }> =
  {
    success: {
      fg: 'text-success-600 dark:text-success-400',
      bg: 'bg-success-100 dark:bg-success-950',
    },
    warning: {
      fg: 'text-warning-600 dark:text-warning-400',
      bg: 'bg-warning-100 dark:bg-warning-950',
    },
    danger: {
      fg: 'text-error-600 dark:text-error-400',
      bg: 'bg-error-100 dark:bg-error-950',
    },
    info: {
      fg: 'text-info-600 dark:text-info-400',
      bg: 'bg-info-50 dark:bg-info-900',
    },
    neutral: {
      fg: 'text-gray-500 dark:text-gray-dark-400',
      bg: 'bg-gray-100 dark:bg-gray-dark-800',
    },
    primary: {
      fg: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950',
    },
  };

export interface FeaturedIconProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'color'
> {
  icon: ReactNode;
  variant?: FeaturedIconVariant;
  /** Visual tone: two-ring outline (default) or flat light-fill solid. */
  tone?: FeaturedIconTone;
  size?: FeaturedIconSize;
  style?: CSSProperties;
}

export const FeaturedIcon = forwardRef<HTMLDivElement, FeaturedIconProps>(
  (
    {
      icon,
      variant = 'success',
      tone = 'outline',
      size = 'md',
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const isSolid = tone === 'solid';
    const outerSize = isSolid ? SOLID_SIZE[size] : OUTER_SIZE[size];
    const innerSize = INNER_SIZE[size];
    const iconSize = ICON_SIZE[size];

    const { fg, bg } = VARIANT_STYLES[variant];

    return (
      <div
        ref={ref}
        data-variant={variant}
        data-tone={tone}
        className={cn(
          // Base outer styles
          'featured-icon inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          // Foreground color establishes `currentColor` for borders and inner SVG!
          fg,
          // Tone-based outer styling
          isSolid
            ? `border-transparent ${bg}`
            : 'border-current/10 bg-transparent',
          className,
        )}
        style={{ width: outerSize, height: outerSize, ...style }}
        {...props}
      >
        <div
          data-testid="featured-icon-inner"
          className={cn(
            // Base inner styles
            'featured-icon-inner inline-flex items-center justify-center rounded-full border-2',
            // Tone-based inner styling
            isSolid ? 'border-transparent' : 'border-current/30',
            // Sizes the SVG node provided by the caller unconditionally via CSS
            '[&>svg]:w-[var(--icon-size)] [&>svg]:h-[var(--icon-size)]',
          )}
          style={
            {
              width: innerSize,
              height: innerSize,
              '--icon-size': `${iconSize}px`,
              '--featured-icon-svg-size': `${iconSize}px`,
            } as CSSProperties
          }
        >
          {icon}
        </div>
      </div>
    );
  },
);

FeaturedIcon.displayName = 'FeaturedIcon';
