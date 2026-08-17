import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC, ReactNode } from 'react';

import { cn } from './cn';
import { LoadingSpinner } from './LoadingSpinner';
import { Tooltip } from './Tooltip';

/**
 * Tailwind/shadcn rebuild of waldur-homeport's src/core/buttons/BaseButton.tsx
 * (Bootstrap/Metronic). Matches that original's public API exactly so it's
 * a drop-in replacement once graduated — NOT yet wired into production;
 * BaseButton.tsx still ships there.
 *
 * Colors come from waldur-design-tokens/buttonColors.css. Every per-state
 * color/border choice below and the cascade-layer/`!important`/tracking
 * quirks in the class list were extracted and verified empirically against
 * the real BaseButton, not guessed — see
 * waldur-homeport/docs/tailwind-shadcn-migration-notes.md for the full
 * reasoning and evidence behind each one.
 */
const buttonVariants = cva(
  // bg-[transparent]: can't be plain `bg-transparent` — collides with
  // Bootstrap's own `!important` utility class of the same name.
  // tracking-[0.56px]: Bootstrap's fixed button letter-spacing, not
  // em-relative. See migration notes for both.
  //
  // Border is an inset box-shadow, not the `border` property: a real
  // `border` participates in the box's total height (border-box sizing),
  // and the real Bootstrap BaseButton's rem-based padding/line-height
  // chain lands on a *fractional* total height at this app's 13px root
  // font-size (e.g. 43.96875px for `lg`), while this component's explicit
  // px values land on an exact integer (44px) — a 1px border around a
  // fractional-height box gets anti-aliased across the sub-pixel
  // boundary, softening it, while the same border around an exact-integer
  // box renders crisp and full-opacity, reading as visibly *thicker* by
  // comparison even though both declare the same 1px/color. box-shadow
  // doesn't participate in layout sizing at all, sidestepping the
  // anti-aliasing difference entirely — confirmed via getComputedStyle
  // that border-width/border-color were already numerically identical
  // between old and new, so this was a pure sub-pixel rendering artifact,
  // not a wrong value. See migration notes.
  //
  // transition-[color,background-color,box-shadow], not transition-colors:
  // Tailwind's transition-colors utility doesn't include box-shadow in its
  // property list, so with the border now living in box-shadow (above),
  // background-color would ease in smoothly on hover while the border
  // snapped instantly — a jarring, half-animated hover effect. See
  // migration notes.
  'inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-[0.56px] font-medium transition-[color,background-color,box-shadow] disabled:pointer-events-none focus-visible:outline-none',
  {
    variants: {
      // Each variant's classes are grouped one state per line (base
      // shadow/bg/text, then hover, focus-visible, active, disabled) and
      // joined with a space — purely a formatting choice, the same
      // literal class strings Tailwind's scanner already saw as one dense
      // line. Splitting them out is what would have made the last three
      // bugs found in this file easy to spot in review: the disabled
      // hover-color leak (a missing disabled: line), the focus-visible
      // shadow needing to combine the border-replacement with the ring
      // (one state, one line, easy to eyeball against its neighbors), and
      // the transition-property gap (a base-string concern, unaffected
      // by this reflow). See migration notes for the full bug writeups.
      variant: {
        primary: [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]',
          'hover:bg-[var(--btn-primary-bg-hover)]',
          'focus-visible:bg-[var(--btn-primary-bg-hover)] focus-visible:shadow-[0_0_0_2px_var(--btn-primary-focus-ring)]',
          'active:bg-[var(--btn-primary-bg-pressed)]',
          'disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // focus-visible:shadow combines the inset border-replacement with
        // the outer 2px ring in one value — box-shadow fully replaces the
        // property per state, so without combining them the border would
        // vanish while focused instead of coexisting with the ring like
        // the real border/box-shadow (two separate properties) does.
        // Applies to every variant below with a real (non-transparent)
        // border: secondary, tertiary, danger, warning, success.
        secondary: [
          'shadow-[inset_0_0_0_1px_var(--btn-secondary-border)]',
          'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)]',
          'hover:bg-[var(--btn-secondary-bg-hover)]',
          'focus-visible:bg-[var(--btn-secondary-bg-hover)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-secondary-border),0_0_0_2px_var(--btn-secondary-focus-ring)]',
          'active:bg-[var(--btn-secondary-bg-pressed)]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        tertiary: [
          'shadow-[inset_0_0_0_1px_var(--btn-tertiary-border)]',
          'bg-[var(--btn-tertiary-bg)] text-[var(--btn-tertiary-text)]',
          'hover:bg-[var(--btn-tertiary-bg-hover)]',
          'focus-visible:bg-[var(--btn-tertiary-bg-hover)] focus-visible:shadow-[inset_0_0_0_1px_var(--btn-tertiary-border),0_0_0_2px_var(--btn-tertiary-focus-ring)]',
          'active:bg-[var(--btn-tertiary-bg-pressed)]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // disabled:bg-[transparent] isn't redundant with the base
        // bg-[transparent] above — real browsers can never actually
        // trigger a disabled button's :hover (pointer-events-none blocks
        // it), but Storybook's pseudo-states addon force-applies :hover
        // via a class-selector rewrite that bypasses that guard, and
        // without an explicit disabled: override the base hover:bg color
        // wins in that one dev-tool-only scenario. Confirmed against the
        // real Bootstrap BaseButton, which doesn't have this gap — its
        // own :hover rule is naturally scoped in a way this class list
        // wasn't. Applies to every transparent-background variant below:
        // tertiary-ghost and all five text-* ones.
        'tertiary-ghost': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-tertiary-text)]',
          'hover:bg-[var(--btn-tertiary-bg-hover)]',
          'active:bg-[var(--btn-tertiary-bg-pressed)]',
          'focus-visible:bg-[var(--btn-tertiary-bg-hover)] focus-visible:shadow-[0_0_0_2px_var(--btn-tertiary-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // danger/warning/success: focus-visible:shadow's inset layer uses
        // each variant's own bg, blending the border into the focus fill
        // (real button behavior).
        danger: [
          'shadow-[inset_0_0_0_1px_var(--btn-danger-border)]',
          'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)]',
          'hover:bg-[var(--btn-danger-bg-hover)]',
          'active:bg-[var(--btn-danger-bg-pressed)]',
          'focus-visible:shadow-[inset_0_0_0_1px_var(--btn-danger-bg),0_0_0_2px_var(--btn-danger-focus-ring)]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        warning: [
          'shadow-[inset_0_0_0_1px_var(--btn-warning-border)]',
          'bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)]',
          // Also blends its border on hover, not just focus — asymmetric
          // with danger/success above, confirmed not assumed.
          'hover:bg-[var(--btn-warning-bg-hover)] hover:shadow-[inset_0_0_0_1px_var(--btn-warning-bg-hover)]',
          'active:bg-[var(--btn-warning-bg-pressed)]',
          'focus-visible:shadow-[inset_0_0_0_1px_var(--btn-warning-bg),0_0_0_2px_var(--btn-warning-focus-ring)]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        success: [
          'shadow-[inset_0_0_0_1px_var(--btn-success-border)]',
          'bg-[var(--btn-success-bg)] text-[var(--btn-success-text)]',
          'hover:bg-[var(--btn-success-bg-hover)]',
          'active:bg-[var(--btn-success-bg-pressed)]',
          'focus-visible:shadow-[inset_0_0_0_1px_var(--btn-success-bg),0_0_0_2px_var(--btn-success-focus-ring)]',
          'disabled:shadow-[inset_0_0_0_1px_transparent] disabled:bg-[var(--btn-disabled-bg)] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-primary': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-primary-color)]',
          'hover:bg-[var(--btn-secondary-bg)]',
          'focus-visible:bg-[var(--btn-secondary-bg-hover)] focus-visible:shadow-[0_0_0_2px_var(--btn-primary-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-secondary': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-secondary-color)]',
          'hover:bg-[var(--btn-text-secondary-hover-bg)]',
          'focus-visible:bg-[var(--btn-text-secondary-hover-bg)] focus-visible:shadow-[0_0_0_2px_var(--btn-tertiary-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        // text-danger/warning/success change TEXT color on hover/focus too
        // (unlike text-primary/secondary above) — reuses each solid
        // variant's own interactive-state text color.
        'text-danger': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-danger-color)]',
          'hover:bg-[var(--btn-danger-bg-hover)] hover:text-[var(--btn-danger-text)]',
          'focus-visible:bg-[var(--btn-danger-bg)] focus-visible:text-[var(--btn-danger-text)] focus-visible:shadow-[0_0_0_2px_var(--btn-danger-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-warning': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-warning-color)]',
          'hover:bg-[var(--btn-warning-bg-hover)] hover:text-[var(--btn-warning-text)]',
          'focus-visible:bg-[var(--btn-warning-bg)] focus-visible:text-[var(--btn-warning-text)] focus-visible:shadow-[0_0_0_2px_var(--btn-warning-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
        'text-success': [
          'shadow-[inset_0_0_0_1px_transparent]',
          'bg-[transparent] text-[var(--btn-text-success-color)]',
          'hover:bg-[var(--btn-success-bg-hover)] hover:text-[var(--btn-success-text)]',
          'focus-visible:bg-[var(--btn-success-bg)] focus-visible:text-[var(--btn-success-text)] focus-visible:shadow-[0_0_0_2px_var(--btn-success-focus-ring)]',
          'disabled:bg-[transparent] disabled:text-[var(--btn-disabled-text)]',
        ].join(' '),
      },
      // Height is deliberately not fixed — it's derived from padding +
      // line-height + border-replacement shadow, same total as the real
      // BaseButton (Bootstrap sets no explicit height either). Padding is
      // 1px taller on each side than a literal border would need, since
      // box-shadow (unlike border) doesn't consume padding-box space —
      // sm = 28px (py-[4px] + leading-5 [20px] + 2×1px shadow-replaced
      // border, 6px radius), lg = 44px (py-[10px] + leading-6 [24px] +
      // 2×1px shadow-replaced border, 8px radius). Values empirically
      // extracted via getComputedStyle on the real component, not
      // estimated.
      size: {
        sm: 'rounded-md px-[7px] py-[4px] text-sm leading-5',
        lg: 'rounded-lg px-[15px] py-[10px] text-base leading-6',
      },
      iconOnly: {
        true: 'aspect-square px-0',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      iconOnly: false,
    },
  },
);

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

interface BaseButtonProps extends Omit<
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
  variant?: ButtonVariant;
  pending?: boolean;
  size: 'sm' | 'lg';
  type?: 'button' | 'submit';
  id?: string;
  form?: string;
  [key: `data-${string}`]: string | undefined;
}

const wrapTooltip = (
  tooltip: string | undefined,
  children: ReactNode,
  isDisabled?: boolean,
  fullWidth?: boolean,
) => {
  if (!tooltip) {
    return children;
  }
  // Same rationale as the original: a disabled <button> has
  // pointer-events: none, so the tooltip trigger never fires unless
  // wrapped in a live element.
  const trigger = isDisabled ? (
    <span className={cn('inline-block', fullWidth && 'w-full')}>
      {children}
    </span>
  ) : (
    children
  );
  return <Tooltip label={tooltip}>{trigger}</Tooltip>;
};

export const BaseButton: FC<BaseButtonProps> = ({
  label,
  onClick,
  iconNode,
  iconRight = false,
  className,
  disabled,
  tooltip,
  disabledReason,
  variant,
  pending,
  size,
  type = 'button',
  id,
  form,
  ...rest
}) => {
  const isDisabled = disabled || pending;
  const effectiveTooltip = isDisabled ? (disabledReason ?? tooltip) : tooltip;
  const isIconOnly = !label && !!iconNode;

  const iconSizeClass = size === 'sm' ? 'size-4' : 'size-5';
  const iconElement = iconNode && (
    <span className={cn('inline-flex shrink-0', iconSizeClass)}>
      {iconNode}
    </span>
  );

  const dataProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-')),
  );

  return wrapTooltip(
    effectiveTooltip,
    <button
      id={id}
      type={type}
      className={cn(
        buttonVariants({ variant, size, iconOnly: isIconOnly }),
        className,
      )}
      onClick={onClick}
      disabled={isDisabled}
      form={form}
      aria-label={
        !label && typeof effectiveTooltip === 'string'
          ? effectiveTooltip
          : undefined
      }
      {...dataProps}
    >
      {pending && <LoadingSpinner className={label ? 'me-1' : undefined} />}
      {!pending && !iconRight && iconElement}
      {label}
      {!pending && iconRight && iconElement}
    </button>,
    isDisabled,
    typeof className === 'string' && /\bw-100\b/.test(className),
  );
};
