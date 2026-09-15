import { FC } from 'react';
import { Variant } from 'react-bootstrap/types';

import { Tooltip } from 'waldur-ui';

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
      <Tooltip
        label={errorsExist ? <FieldErrorMessage error={errors} center /> : null}
        autoWidth
        contentClassName="mw-225px"
      >
        <SubmitButton
          submitting={submitting}
          variant={variant}
          disabled={disabled || errorsExist}
          label={label || translate('Submit')}
          className="w-100 w-100"
        />
      </Tooltip>
    </FloatingButton>
  );
};
