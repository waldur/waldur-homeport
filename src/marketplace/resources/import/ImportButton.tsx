import classNames from 'classnames';
import { FunctionComponent } from 'react';

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
        <i className="fa fa-spinner fa-spin" />{' '}
      </>
    )}
    {translate('Import')}
  </button>
);
