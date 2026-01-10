import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';

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
  /** Bootstrap button variant */
  variant?: ButtonVariant;
  /** Loading/pending state - shows spinner and disables button */
  pending?: boolean;
  /** Button size */
  size: 'sm' | 'lg';
  /** Button type */
  type?: 'button' | 'submit';
  /** Button ID attribute */
  id?: string;
  /** Data attributes for testing/integration */
  [key: `data-${string}`]: string | undefined;
}

const wrapTooltip = (tooltip: string | undefined, children: ReactNode) =>
  tooltip ? (
    <Tip label={tooltip} id="button-tooltip">
      {children}
    </Tip>
  ) : (
    children
  );

export const BaseButton: FC<BaseButtonProps> = ({
  label,
  onClick,
  iconNode,
  iconRight = false,
  className,
  disabled,
  tooltip,
  variant,
  pending,
  size,
  type = 'button',
  id,
  ...rest
}) => {
  const iconSize = size === 'sm' ? '4' : '2';
  const iconElement = iconNode && (
    <span className={`svg-icon svg-icon-${iconSize}`}>{iconNode}</span>
  );

  // Extract only data-* attributes
  const dataProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-')),
  );

  return wrapTooltip(
    tooltip,
    <Button
      id={id}
      type={type}
      className={classNames(className, {
        disabled: disabled || pending,
        'btn-icon': !label && iconNode,
        'btn-icon-right': iconRight && label,
      })}
      size={size}
      onClick={onClick}
      variant={variant}
      disabled={disabled || pending}
      {...dataProps}
    >
      {pending && <LoadingSpinnerIcon className={label ? 'me-1' : undefined} />}
      {!pending && !iconRight && iconElement}
      {label}
      {!pending && iconRight && iconElement}
    </Button>,
  );
};
