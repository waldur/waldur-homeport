import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

interface TableRefreshButtonProps {
  fetch: () => void;
}

export const TableRefreshButton: FunctionComponent<TableRefreshButtonProps> = ({
  fetch,
}) => (
  <a className="btn btn-light" onClick={fetch}>
    <i className="fa fa-refresh" />
    &nbsp;{translate('Refresh')}
  </a>
);
