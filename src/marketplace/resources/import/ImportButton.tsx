import * as classNames from 'classnames';
import * as React from 'react';

import { translate } from '@waldur/i18n';

export const ImportButton = ({ disabled, loading, onClick }) => (
  <button
    className={classNames('btn btn-primary', {disabled: disabled || loading })}
    type="button"
    onClick={onClick}>
    {loading && (
      <>
        <i className="fa fa-spinner fa-spin"/>
        {' '}
      </>
    )}
    {translate('Import')}
  </button>
);
