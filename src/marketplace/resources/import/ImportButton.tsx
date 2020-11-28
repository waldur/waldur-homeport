import classNames from 'classnames';
import React from 'react';

import { translate } from '@waldur/i18n';

export const ImportButton = ({ disabled, submitting, onClick }) => (
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
