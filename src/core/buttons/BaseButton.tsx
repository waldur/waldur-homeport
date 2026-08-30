import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';

interface BaseButtonProps {
  /** Button text label */
  label?: ReactNode;
  /** Click handler */
  onClick?: (event?: any) => void;
  /** Optional icon to display */
  iconNode?: ReactNode;
  /** Place icon on the right side (default: left) */
  iconRight?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Tooltip shown only when button is disabled/pending — explains why the action is unavailable */
  disabledReason?: string;
  /** Bootstrap button variant */
  variant?: ButtonVariant;
  /** Loading/pending state - shows spinner and disables button */
  pending?: boolean;
  /** Button size; omit for the default medium. */
  size?: 'sm' | 'lg';
  /** Button type */
  type?: 'button' | 'submit';
  /** Button ID attribute */
  id?: string;
  /** Associates button with a form by ID (for buttons outside the form element) */
  form?: string;
  /** Data attributes for testing/integration */
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
  // A disabled <button> has `pointer-events: none`, so the tooltip's hover
  // trigger never fires and the explanatory tooltip stays hidden. Wrap the
  // disabled button in an inline-block span (which does receive pointer
  // events) so the OverlayTrigger has a live element to hover — this is what
  // makes "disabled buttons must explain why" actually work in the UI. Mirror
  // `w-100` onto the wrapper so full-width buttons keep their width (an
  // inline-block wrapper would otherwise shrink-wrap them).
  const trigger = isDisabled ? (
    <span className={classNames('d-inline-block', { 'w-100': fullWidth })}>
      {children}
    </span>
  ) : (
    children
  );
  return (
    <Tip label={tooltip} id="button-tooltip">
      {trigger}
    </Tip>
  );
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

  const iconSize = size === 'sm' ? '4' : '2';
  const iconElement = iconNode && (
    <span className={`svg-icon svg-icon-${iconSize}`}>{iconNode}</span>
  );

  // Extract only data-* attributes
  const dataProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-')),
  );

  return wrapTooltip(
    effectiveTooltip,
    <Button
      id={id}
      type={type}
      className={classNames(className, {
        disabled: isDisabled,
        'btn-icon': !label && iconNode,
        'btn-icon-right': iconRight && label,
      })}
      size={size}
      onClick={onClick}
      variant={variant}
      disabled={isDisabled}
      form={form}
      aria-label={
        !label && typeof effectiveTooltip === 'string'
          ? effectiveTooltip
          : undefined
      }
      {...dataProps}
    >
      {pending && (
        <LoadingSpinnerSimple className={label ? 'me-1' : undefined} />
      )}
      {!pending && !iconRight && iconElement}
      {label}
      {!pending && iconRight && iconElement}
    </Button>,
    isDisabled,
    typeof className === 'string' && /\bw-100\b/.test(className),
  );
};
