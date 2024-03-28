import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { FloatingButton } from './FloatingButton';

export const FloatingSubmitButton: FC<{ label?; disabled?; submitting }> = ({
  label,
  disabled,
  submitting,
}) => (
  <FloatingButton>
    <Button
      size="sm"
      variant="primary"
      type="submit"
      disabled={disabled || submitting}
      className="w-100"
    >
      {submitting && <i className="fa fa-spinner fa-spin me-1" />}
      {label || translate('Submit')}
    </Button>
  </FloatingButton>
);
