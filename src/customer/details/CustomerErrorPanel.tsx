import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCustomer } from '@waldur/workspace/selectors';

const CustomerErrorDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerErrorDialog" */ './CustomerErrorDialog'
    ),
  'CustomerErrorDialog',
);

export const CustomerErrorPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const reportError = () =>
    dispatch(openModalDialog(CustomerErrorDialog, { resolve: { customer } }));

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
