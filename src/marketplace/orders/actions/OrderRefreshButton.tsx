import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const OrderRefreshButton: FunctionComponent<any> = (props) => (
  <button
    type="button"
    className="btn btn-secondary btn-sm me-2"
    onClick={props.loadData}
  >
    <i className="fa fa-refresh" /> {translate('Refresh')}
  </button>
);
