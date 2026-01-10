import { FC, ReactNode } from 'react';

import { BaseButton } from '@waldur/core/buttons/BaseButton';
import { translate } from '@waldur/i18n';

interface CompactSubmitButtonProps {
  /** Loading/submitting state - shows spinner and disables button */
  submitting: boolean;
  /** Button text label */
  label?: ReactNode;
  /** Alternative to label - rendered as children */
  children?: ReactNode;
  /** Button ID attribute */
  id?: string;
  /** Disabled state (independent of submitting) */
  disabled?: boolean;
  /** Form validation state - disables button when true */
  invalid?: boolean;
  /** Bootstrap button variant - defaults to 'primary' */
  variant?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button type - defaults to 'submit' */
  type?: 'submit' | 'button';
  /** Click handler */
  onClick?(event: React.MouseEvent<HTMLButtonElement>): void;
  /** Optional icon to display */
  iconNode?: ReactNode;
  /** Place icon on the left side (default: false, icon on right) */
  iconOnLeft?: boolean;
  /** Data attributes for testing/integration */
  [key: `data-${string}`]: string | undefined;
}

/**
 * CompactSubmitButton - for compact form contexts like popovers and inline forms.
 * Uses small size to fit within constrained spaces.
 *
 * For regular forms, use SubmitButton instead (which uses large size).
 */
export const CompactSubmitButton: FC<CompactSubmitButtonProps> = ({
  submitting,
  label,
  children,
  id,
  disabled,
  invalid,
  variant = 'primary',
  className,
  type = 'submit',
  onClick,
  iconNode,
  iconOnLeft = false,
  ...rest
}) => (
  <BaseButton
    id={id}
    label={children || label || translate('Submit')}
    onClick={onClick}
    iconNode={iconNode}
    iconRight={!iconOnLeft}
    className={className}
    disabled={disabled || invalid}
    variant={variant}
    pending={submitting}
    size="sm"
    type={type}
    {...rest}
  />
);
