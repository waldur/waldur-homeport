import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { translate } from '@/i18n';

import { useModal } from './hooks';

interface CloseDialogButtonProps {
  /** Button label - defaults to 'Cancel' */
  label?: string;
  /** Bootstrap button variant - defaults to 'tertiary' */
  variant?: ButtonVariant;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
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
  onClick,
}) => {
  const { closeDialog } = useModal();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      closeDialog();
    }
  };

  return (
    <Button
      className={className}
      onClick={handleClick}
      variant={variant}
      disabled={disabled}
    >
      {label || translate('Cancel')}
    </Button>
  );
};
