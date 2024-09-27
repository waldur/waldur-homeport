import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

export const ImportButton: FunctionComponent<{
  disabled?;
  submitting;
}> = ({ disabled, submitting }) => (
  <Button
    disabled={disabled || submitting}
    className="flex-equal"
    type="submit"
  >
    {submitting && (
      <>
        <LoadingSpinnerIcon />{' '}
      </>
    )}
    {translate('Import')}
  </Button>
);
