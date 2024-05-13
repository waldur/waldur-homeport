import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

export const ImportButton: FunctionComponent<{
  disabled;
  submitting;
  onClick;
}> = ({ disabled, submitting, onClick }) => (
  <button
    className={classNames('btn btn-primary', {
      disabled: disabled || submitting,
    })}
    type="button"
    onClick={onClick}
  >
    {submitting && (
      <>
        <LoadingSpinnerIcon />{' '}
      </>
    )}
    {translate('Import')}
  </button>
);
