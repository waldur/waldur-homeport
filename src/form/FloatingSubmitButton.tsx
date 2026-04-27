import { FC } from 'react';
import { Variant } from 'react-bootstrap/types';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { FieldErrorMessage } from './FieldError';
import { FloatingButton } from './FloatingButton';
import { SubmitButton } from './SubmitButton';

interface OwnProps {
  label?: any;
  disabled?: boolean;
  submitting: boolean;
  errors?: Record<string, any>;
  variant?: Variant;
}

export const FloatingSubmitButton: FC<OwnProps> = ({
  label,
  disabled,
  submitting,
  errors,
  variant = 'primary',
}) => {
  const errorsExist = errors && Object.keys(errors).length > 0;
  return (
    <FloatingButton>
      <Tip
        label={errorsExist ? <FieldErrorMessage error={errors} center /> : null}
        id="floating-button-errors"
        autoWidth
        className="w-100"
        tipClassName="mw-225px"
      >
        <SubmitButton
          submitting={submitting}
          variant={variant}
          disabled={disabled || errorsExist}
          className="w-100"
          label={label || translate('Submit')}
        />
      </Tip>
    </FloatingButton>
  );
};
