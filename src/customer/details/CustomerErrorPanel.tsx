import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerErrorPanel = () => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const reportError = () =>
    dispatch(openModalDialog('customerErrorDialog', { resolve: { customer } }));

  return (
    <div className="highlight">
      <h3>{translate('Report incorrect data')}</h3>
      <p>{translate('You can create issue by pressing the button below')}</p>
      <a onClick={reportError} className="btn btn-success">
        <i className="fa fa-bug" /> {translate('Report incorrect data')}
      </a>
    </div>
  );
};
