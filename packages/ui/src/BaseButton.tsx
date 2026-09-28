import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

import { cn } from './cn';
import { LoadingSpinner } from './LoadingSpinner';
import { Tooltip, type TooltipProps } from './Tooltip';

/**
 * BaseButton - Core button component for waldur-ui.
 *
 * Colors are defined in waldur-design-tokens/buttonColors.css.
 * Supports variants, sizes, icon placement, tooltips, and loading states.
 */
/**
 * Exported so non-`<button>` elements (such as links and dropdown triggers)
 * can apply the button styles directly. `iconOnly` defaults to `false`:
 * pass it explicitly for a square, icon-only element.
 */
export const buttonVariants = cva(
  // - Border is rendered as an inset box-shadow to avoid layout height shifts.
  // - transition-[color,background-color,box-shadow] ensures both background and inset-shadow border animate smoothly.
  // - Focus rings use native outline properties for accessibility and forced-colors support.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-[0.56px] font-medium transition-[color,background-color,box-shadow] disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
  {
    variants: {
      // Classes are organized per state: base, hover, focus-visible, active, disabled.
      // - focus-visible: provides focus indicator for keyboard navigation without lingering on mouse click.
      // - active:shadow-none clears shadow when pressed.
      variant: {
        primary: [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]',
          'hover:bg-[var(--btn-primary-bg-hover)]',
          'focus-visible:bg-[var(--btn-primary-bg-hover)] focus-visible:[outline:2px_solid_var(--btn-primary-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[var(--btn-primary-bg-pressed)] active:shadow-none',
          'disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // Inset shadow maintains the border during focus-visible state.
        // Sets [--btn-icon-color] for signature two-tone styling (plum text + magenta icon).
        secondary: [
          'shadow-[inset_0_0_0_1px_var(--btn-secondary-border)]',
          'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)]',
          '[--btn-icon-color:var(--btn-secondary-icon)]',
          'hover:bg-[var(--btn-secondary-bg-hover)]',
          'focus-visible:bg-[var(--btn-secondary-bg-hover)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-secondary-border)] focus-visible:[outline:2px_solid_var(--btn-secondary-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[var(--btn-secondary-bg-pressed)] active:shadow-none',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] disabled:[--btn-icon-color:var(--btn-disabled-text)] data-disabled:shadow-[inset_0_0_0_1px_transparent] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)] data-disabled:[--btn-icon-color:var(--btn-disabled-text)]',
        ].join(' '),
        tertiary: [
          'shadow-[inset_0_0_0_1px_var(--btn-tertiary-border)]',
          'bg-[var(--btn-tertiary-bg)] text-[var(--btn-tertiary-text)]',
          'hover:bg-[var(--btn-tertiary-bg-hover)]',
          'focus-visible:bg-[var(--btn-tertiary-bg-hover)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-tertiary-border)] focus-visible:[outline:2px_solid_var(--btn-tertiary-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[var(--btn-tertiary-bg-pressed)] active:shadow-none',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] data-disabled:shadow-[inset_0_0_0_1px_transparent] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // Explicit disabled:bg-[transparent] ensures hover styling is suppressed when disabled.
        'tertiary-ghost': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-tertiary-text)]',
          'hover:bg-[var(--btn-tertiary-bg-hover)]',
          'active:bg-[var(--btn-tertiary-bg-pressed)] active:shadow-none',
          'focus-visible:bg-[var(--btn-tertiary-bg-hover)] focus-visible:[outline:2px_solid_var(--btn-tertiary-focus-ring)] focus-visible:[outline-offset:0px]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // danger, warning, success switch text to high-contrast white on active press.
        danger: [
          'shadow-[inset_0_0_0_1px_var(--btn-danger-border)]',
          'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)]',
          'hover:bg-[var(--btn-danger-bg-hover)]',
          'active:bg-[var(--btn-danger-bg-pressed)] active:text-[var(--btn-pressed-text-on-vivid)] active:shadow-none',
          'focus-visible:bg-[var(--btn-danger-bg)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-danger-bg)] focus-visible:[outline:2px_solid_var(--btn-danger-focus-ring)] focus-visible:[outline-offset:0px]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] data-disabled:shadow-[inset_0_0_0_1px_transparent] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        warning: [
          'shadow-[inset_0_0_0_1px_var(--btn-warning-border)]',
          'bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)]',
          // Blends border on hover to match background tint.
          'hover:bg-[var(--btn-warning-bg-hover)] hover:shadow-[inset_0_0_0_1px_var(--btn-warning-bg-hover)]',
          'active:bg-[var(--btn-warning-bg-pressed)] active:text-[var(--btn-pressed-text-on-vivid)] active:shadow-none',
          'focus-visible:bg-[var(--btn-warning-bg)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-warning-bg)] focus-visible:[outline:2px_solid_var(--btn-warning-focus-ring)] focus-visible:[outline-offset:0px]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] data-disabled:shadow-[inset_0_0_0_1px_transparent] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        success: [
          'shadow-[inset_0_0_0_1px_var(--btn-success-border)]',
          'bg-[var(--btn-success-bg)] text-[var(--btn-success-text)]',
          'hover:bg-[var(--btn-success-bg-hover)]',
          'active:bg-[var(--btn-success-bg-pressed)] active:text-[var(--btn-pressed-text-on-vivid)] active:shadow-none',
          'focus-visible:bg-[var(--btn-success-bg)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-success-bg)] focus-visible:[outline:2px_solid_var(--btn-success-focus-ring)] focus-visible:[outline-offset:0px]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)] data-disabled:shadow-[inset_0_0_0_1px_transparent] data-disabled:bg-[var(--btn-disabled-bg)] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // Explicit active:bg-[transparent] keeps text buttons transparent while pressed.
        'text-primary': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-primary-color)]',
          'hover:bg-[var(--btn-secondary-bg)]',
          'focus-visible:bg-[var(--btn-secondary-bg-hover)] focus-visible:[outline:2px_solid_var(--btn-primary-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[transparent] active:text-[var(--btn-text-primary-pressed)] active:shadow-none',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-secondary': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-secondary-color)]',
          'hover:bg-[var(--btn-text-secondary-hover-bg)]',
          'focus-visible:bg-[var(--btn-text-secondary-hover-bg)] focus-visible:[outline:2px_solid_var(--btn-text-secondary-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[transparent] active:shadow-none',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // Updates text color to the corresponding interactive tone on hover and focus.
        'text-danger': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-danger-color)]',
          'hover:bg-[var(--btn-danger-bg-hover)] hover:text-[var(--btn-danger-text)]',
          'focus-visible:bg-[var(--btn-danger-bg)] focus-visible:text-[var(--btn-danger-text)] focus-visible:[outline:2px_solid_var(--btn-danger-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[transparent] active:shadow-none',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-warning': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-warning-color)]',
          'hover:bg-[var(--btn-warning-bg-hover)] hover:text-[var(--btn-warning-text)]',
          'focus-visible:bg-[var(--btn-warning-bg)] focus-visible:text-[var(--btn-warning-text)] focus-visible:[outline:2px_solid_var(--btn-warning-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[transparent] active:shadow-none',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-success': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-success-color)]',
          'hover:bg-[var(--btn-success-bg-hover)] hover:text-[var(--btn-success-text)]',
          'focus-visible:bg-[var(--btn-success-bg)] focus-visible:text-[var(--btn-success-text)] focus-visible:[outline:2px_solid_var(--btn-success-focus-ring)] focus-visible:[outline-offset:0px]',
          'active:bg-[transparent] active:shadow-none',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)] data-disabled:bg-[transparent] data-disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
      },
      // Heights derived from padding and line-height:
      // - sm: 28px tall (py-[4px] + leading-5 [20px] + 2x 2px inset shadow, 6px radius)
      // - md: 36px tall (py-[8px] + leading-5 [20px] + 2x 2px inset shadow, 8px radius)
      // - lg: 44px tall (py-[10px] + leading-6 [24px] + 2x 2px inset shadow, 8px radius)
      size: {
        sm: 'rounded-md px-[8px] py-[4px] text-sm leading-5',
        md: 'rounded-lg px-[12px] py-[8px] text-sm leading-5',
        lg: 'rounded-lg px-[16px] py-[10px] text-base leading-6',
      },
      // Padding reset for icon-only buttons; dimensions (28px/36px/44px) are pinned in compoundVariants below.
      iconOnly: {
        true: 'p-0',
        false: '',
      },
    },
    compoundVariants: [
      { size: 'sm', iconOnly: true, class: 'h-[28px] w-[28px]' },
      { size: 'md', iconOnly: true, class: 'h-[36px] w-[36px]' },
      { size: 'lg', iconOnly: true, class: 'h-[44px] w-[44px]' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      iconOnly: false,
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

/** Derived from the cva `size` variants above, so it can never drift from what buttonVariants() renders. */
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>;

export interface BaseButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> {
  label?: ReactNode;
  onClick?: (event?: any) => void;
  iconNode?: ReactNode;
  iconRight?: boolean;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  disabledReason?: string;
  /** Placement side for the tooltip ('top' | 'right' | 'bottom' | 'left'). Defaults to 'top'. */
  tooltipSide?: TooltipProps['side'];
  variant?: ButtonVariant;
  pending?: boolean;
  /** Button size ('sm' | 'md' | 'lg'). Defaults to 'md' (36px). */
  size?: ButtonSize;
  type?: 'button' | 'submit';
  id?: string;
  form?: string;
  [key: `data-${string}`]: string | undefined;
}

/**
 * forwardRef, and `...rest` reaching the <button>, are both requirements
 * for this to work as a Radix `asChild` trigger (DropdownMenuTrigger,
 * PopoverTrigger) — the composition every migrated dropdown depends on.
 * Radix's Slot clones its child, attaches a ref the popper positions
 * against, and merges in aria-haspopup/aria-expanded/data-state plus its
 * own pointer/keyboard handlers. A plain FC drops the ref (React's
 * "Function components cannot be given refs"), and the previous
 * data-*-only filter on `rest` silently swallowed the ARIA and the
 * handlers, leaving a button that looks right and does nothing. See
 * TopBar.tsx's IconButton for the same requirement stated at that
 * component.
 */
export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      label,
      onClick,
      iconNode,
      iconRight = false,
      className,
      disabled,
      tooltip,
      disabledReason,
      tooltipSide,
      variant,
      pending,
      size,
      type = 'button',
      id,
      form,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || pending;
    const effectiveTooltip = isDisabled ? (disabledReason ?? tooltip) : tooltip;
    const isIconOnly = !label && !!iconNode;

    const iconElement = iconNode && (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center text-[var(--btn-icon-color,currentColor)]',
          size === 'sm' ? 'size-4 [&>svg]:size-4' : 'size-5 [&>svg]:size-5',
        )}
      >
        {iconNode}
      </span>
    );

    const button = (
      <button
        ref={ref}
        id={id}
        type={type}
        className={cn(
          buttonVariants({ variant, size, iconOnly: isIconOnly }),
          className,
        )}
        onClick={onClick}
        disabled={isDisabled}
        data-disabled={isDisabled ? '' : undefined}
        form={form}
        aria-label={
          !label && typeof effectiveTooltip === 'string'
            ? effectiveTooltip
            : undefined
        }
        {...rest}
      >
        {pending && (
          <LoadingSpinner
            // Offsets the default gap so the spinner sits closer to the label.
            className={label ? '-me-[3.25px]' : undefined}
          />
        )}
        {!pending && !iconRight && iconElement}
        {label}
        {!pending && iconRight && iconElement}
      </button>
    );

    return (
      <Tooltip
        label={effectiveTooltip}
        side={tooltipSide}
        alwaysMount={!!tooltip || !!disabledReason}
      >
        {button}
      </Tooltip>
    );
  },
);
BaseButton.displayName = 'BaseButton';
