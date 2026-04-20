import { FC, ReactNode } from 'react';

import { BaseButton } from '@waldur/core/buttons/BaseButton';
import { translate } from '@waldur/i18n';

interface SubmitButtonProps {
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
  /** Bootstrap button size - defaults to 'lg' */
  size?: 'sm' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Button type - defaults to 'submit' */
  type?: 'submit' | 'button';
  /** Associates button with a form by ID (for buttons outside the form element) */
  form?: string;
  /** Tooltip shown only when button is disabled/pending */
  disabledReason?: string;
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
 * SubmitButton - for form submission.
 * Always renders at large size for visual consistency.
 * Use CompactSubmitButton for compact form contexts (popovers, inline forms).
 */
export const SubmitButton: FC<SubmitButtonProps> = ({
  submitting,
  label,
  children,
  id,
  disabled,
  invalid,
  disabledReason,
  variant = 'primary',
  className,
  type = 'submit',
  form,
  onClick,
  iconNode,
  iconOnLeft = false,
  size = 'lg',
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
    disabledReason={disabledReason}
    variant={variant}
    pending={submitting}
    size={size}
    type={type}
    form={form}
    {...rest}
  />
);
