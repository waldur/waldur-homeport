import { cva, type VariantProps } from 'class-variance-authority';
import {
  ButtonHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';

import { cn } from '../cn';
import { Tooltip, type TooltipProps } from '../Tooltip';

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

// Badges are always the bordered outline style.
export type BadgeTone = 'outline';
export type BadgeShape = 'pill' | 'circle' | 'roundless';

/**
 * Maps 15 Variants × 3 Tones directly to Tailwind classes.
 * Dark mode handles exact overrides (e.g. `dark:bg-brand-950`).
 * Badge renders only `outline`; `solid` and `light` remain for ModePicker
 * and the Progress colour parity.
 *
 * Note: `solid` and `light` tones use `border-transparent` because
 * the `border` is structural. Visually, a transparent border
 * over a background color is identical to setting `border-color: same-as-bg`.
 *
 * Every pair reaches WCAG AA (4.5:1) for its text in both themes, which
 * Badge.contrast.test.ts checks against the token CSS:
 * - `light` tones take the status matrix where there is one; the other
 *   hues use the 700 text step on the 50 tint (600 read 3.3-4.4:1).
 * - `solid` fills are the Progress bar fills (progressTokens.test.ts holds
 *   them equal), and their text is the Progress label for the same fill:
 *   dark on the lighter fills, where white read 2.3-3.7:1.
 */
export const BADGE_STYLES: Record<
  BadgeVariant,
  Record<'solid' | 'light' | 'outline', string>
> = {
  primary: {
    solid: 'border-transparent bg-brand-solid text-white',
    light: 'border-transparent bg-brand-50 text-brand dark:bg-brand-950',
    outline:
      'bg-brand-subtle border-brand-200 text-brand-700 dark:border-brand-700 dark:text-brand-200',
  },
  secondary: {
    solid:
      'border-transparent bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    light: 'border-transparent bg-brand-50 text-brand dark:bg-brand-950',
    outline:
      'bg-brand-subtle border-brand-200 text-brand-700 dark:border-brand-700 dark:text-brand-200',
  },
  success: {
    solid: 'border-transparent bg-success text-gray-900 dark:text-gray-900',
    light: 'border-transparent bg-success-subtle text-success',
    outline:
      // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- the outline tone's 200/700 border steps sit outside the status matrix
      'bg-success-subtle border-success-200 text-success-700 dark:border-success-700 dark:text-success-200',
  },
  warning: {
    solid: 'border-transparent bg-warning text-gray-900 dark:text-gray-900',
    light: 'border-transparent bg-warning-subtle text-warning',
    outline:
      // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- the outline tone's 200/700 border steps sit outside the status matrix
      'bg-warning-subtle border-warning-200 text-warning-700 dark:border-warning-700 dark:text-warning-200',
  },
  danger: {
    solid: 'border-transparent bg-danger text-white dark:text-gray-900',
    light: 'border-transparent bg-danger-subtle text-danger',
    outline:
      // eslint-disable-next-line waldur-custom/no-raw-status-ramp -- the outline tone's 200/700 border steps sit outside the status matrix
      'bg-danger-subtle border-error-200 text-error-700 dark:border-error-700 dark:text-error-200',
  },
  info: {
    solid:
      'border-transparent bg-info-600 text-white dark:bg-info-300 dark:text-gray-900',
    light: 'border-transparent bg-info-subtle text-info',
    outline:
      'bg-info-subtle border-info-200 text-info-700 dark:border-info-700 dark:text-info-200',
  },
  neutral: {
    solid:
      'border-transparent bg-gray-600 text-white dark:bg-gray-dark-400 dark:text-gray-900',
    light: 'border-transparent bg-gray-50 text-tertiary dark:bg-gray-dark-800',
    outline:
      'bg-tertiary border-gray-300 text-secondary dark:border-gray-dark-600',
  },
  purple: {
    solid:
      'border-transparent bg-purple-500 text-white dark:bg-purple-400 dark:text-gray-900',
    light:
      'border-transparent bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    outline:
      'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
  },
  blue: {
    solid:
      'border-transparent bg-blue-500 text-gray-900 dark:bg-blue-400 dark:text-gray-900',
    light:
      'border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    outline:
      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
  },
  indigo: {
    solid:
      'border-transparent bg-indigo-500 text-gray-950 dark:bg-indigo-400 dark:text-gray-950',
    light:
      'border-transparent bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    outline:
      'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200',
  },
  moss: {
    solid:
      'border-transparent bg-moss-500 text-gray-900 dark:bg-moss-400 dark:text-gray-900',
    light:
      'border-transparent bg-moss-50 text-moss-700 dark:bg-moss-950 dark:text-moss-400',
    outline:
      'bg-moss-50 border-moss-200 text-moss-700 dark:bg-moss-900 dark:border-moss-700 dark:text-moss-200',
  },
  pink: {
    solid:
      'border-transparent bg-pink-500 text-gray-900 dark:bg-pink-400 dark:text-gray-900',
    light:
      'border-transparent bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
    outline:
      'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-200',
  },
  teal: {
    solid:
      'border-transparent bg-teal-500 text-gray-900 dark:bg-teal-400 dark:text-gray-900',
    light:
      'border-transparent bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    outline:
      'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-200',
  },
  orange: {
    solid:
      'border-transparent bg-orange-500 text-gray-900 dark:bg-orange-400 dark:text-gray-900',
    light:
      'border-transparent bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    outline:
      'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200',
  },
  rose: {
    solid:
      'border-transparent bg-rose-500 text-gray-900 dark:bg-rose-400 dark:text-gray-900',
    light:
      'border-transparent bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    outline:
      'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900 dark:border-rose-700 dark:text-rose-200',
  },
};

// CVA only handles structural layout variants now.
const badgeVariants = cva(
  'badge inline-flex items-center justify-center border border-secondary text-sm leading-[20px] font-medium transition-colors',
  {
    variants: {
      size: {
        // `leading-[18px]` keeps a small badge 24px tall, the same as an
        // unsized one; legacy `.badge-sm` carried `line-height: 18px`; the
        // Tailwind rewrite dropped it and left the base `leading-[20px]` in
        // place, which made the *small* badge 26px — 2px taller than the
        // default it is supposed to be smaller than.
        sm: 'text-xs leading-[18px]',
        lg: 'text-sm',
      },
      shape: {
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
      shape: 'pill',
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
        class: 'size-5 min-w-5 text-xs p-0',
      },
      {
        shape: 'circle',
        size: 'lg',
        class: 'size-7 min-w-7 text-xs p-0',
      },
      {
        onlyIcon: true,
        size: 'sm',
        class: 'size-5 min-w-5 text-xs p-0',
      },
      {
        onlyIcon: true,
        size: 'lg',
        class: 'size-7 min-w-7 text-xs p-0',
      },
    ],
  },
);

/**
 * A badge rendered as a button: reachable by Tab, pressed with Enter or Space,
 * and ringed when focused. The ring stands 2px off the badge so it shows on a
 * solid fill of the brand colour too; the gap takes the surface behind it, in
 * light and dark alike. The global `:focus-visible` outline is the same width
 * and colour, so this only moves it out.
 */
const BUTTON_CLASSES =
  'cursor-pointer select-none appearance-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

export interface BadgeProps
  extends
    HTMLAttributes<HTMLElement>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof badgeVariants> {
  /**
   * `'button'` renders a `<button type="button">` with the badge's look, for
   * a badge that does something when pressed (opens a dialog, a tooltip). Pass
   * `aria-label` when the text alone does not say what it does. Not inferred
   * from `onClick`: a Tooltip or Popover trigger wrapping the badge hands it
   * one of its own.
   */
  as?: 'span' | 'button';
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

export const Badge = forwardRef<HTMLElement, BadgeProps>(
  (
    {
      as = 'span',
      className,
      variant = 'primary',
      tone = 'outline',
      shape = 'pill',
      size,
      leftIcon,
      rightIcon,
      onlyIcon,
      alignIcon,
      hasBullet,
      tooltip,
      tooltipProps,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isButton = as === 'button';
    void alignIcon;

    const hasContent =
      children !== undefined &&
      children !== null &&
      children !== false &&
      (typeof children !== 'string' || children.trim().length > 0);

    const shared = {
      'data-variant': variant,
      'data-tone': tone,
      className: cn(
        badgeVariants({ size, shape, onlyIcon }),
        BADGE_STYLES[variant][tone],
        isButton && BUTTON_CLASSES,
        className,
      ),
      ...props,
    };
    const content = (
      <>
        {hasBullet && (
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
        )}
        {Boolean(leftIcon) && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center justify-center',
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
              'inline-flex shrink-0 items-center justify-center',
              hasContent && 'ml-1',
            )}
            data-testid="badge-right-icon"
          >
            {rightIcon}
          </span>
        )}
      </>
    );
    const badgeElement = isButton ? (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        {...shared}
      >
        {content}
      </button>
    ) : (
      <span ref={ref} {...shared}>
        {content}
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
