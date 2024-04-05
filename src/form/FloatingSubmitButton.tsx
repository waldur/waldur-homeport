import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/types';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { FieldError } from './FieldError';
import { FloatingButton } from './FloatingButton';

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
  variant,
}) => {
  const errorsExist = errors && Object.keys(errors).length > 0;
  return (
    <FloatingButton>
      <Tip
        label={errorsExist ? <FieldError error={errors} /> : null}
        id="floating-button-errors"
        autoWidth
        className="w-100"
      >
        <Button
          size="sm"
          variant={variant}
          type="submit"
          disabled={disabled || submitting || errorsExist}
          className="w-100"
        >
          {submitting && <i className="fa fa-spinner fa-spin me-1" />}
          {label || translate('Submit')}
        </Button>
      </Tip>
    </FloatingButton>
  );
};

FloatingSubmitButton.defaultProps = {
  variant: 'primary',
};
