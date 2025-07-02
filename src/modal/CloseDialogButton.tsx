import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { translate } from '@waldur/i18n';

import { useModal } from './hooks';

interface OwnProps {
  label?: string;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
}

export const CloseDialogButton: React.FC<OwnProps> = ({
  label,
  variant = 'outline btn-outline-default',
  className,
  disabled,
}) => {
  const { closeDialog } = useModal();

  return (
    <Button
      className={className}
      onClick={() => closeDialog()}
      variant={variant}
      disabled={disabled}
    >
      {label || translate('Cancel')}
    </Button>
  );
};
