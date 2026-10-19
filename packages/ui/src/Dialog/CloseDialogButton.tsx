import React from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton, ButtonVariant } from '../Button';

import { useModalHide } from './Modal';
import { useModal } from './modalContext';

interface CloseDialogButtonProps {
  /** Button label - defaults to 'Cancel' */
  label?: string;
  /** Button variant - defaults to 'tertiary' */
  variant?: ButtonVariant;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Tooltip shown only when the button is disabled, explaining why */
  disabledReason?: string;
  /** Custom click handler - if provided, called instead of closeDialog() */
  onClick?: () => void;
}

/**
 * A button for closing modal dialogs.
 * Use this as the cancel/close button in modal footers.
 *
 * @example
 * ```tsx
 * // Simple usage - closes dialog
 * <CloseDialogButton />
 *
 * // With custom label
 * <CloseDialogButton label={translate('OK')} />
 *
 * // With custom onClick (useful for form cancel with cleanup)
 * <CloseDialogButton onClick={handleCancel} />
 * ```
 */
export const CloseDialogButton: React.FC<CloseDialogButtonProps> = ({
  label,
  variant = 'tertiary',
  className,
  disabled,
  disabledReason,
  onClick,
}) => {
  const { closeDialog } = useModal();
  const hide = useModalHide();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (hide) {
      hide();
    } else {
      closeDialog();
    }
  };

  return (
    <BaseButton
      className={className}
      onClick={handleClick}
      variant={variant}
      size="lg"
      disabled={disabled}
      disabledReason={disabledReason}
      label={label || translate('Cancel')}
    />
  );
};
