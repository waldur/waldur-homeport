import { FunctionComponent } from 'react';

import { TranslateProps } from '@waldur/i18n/types';

interface TableRefreshButtonProps extends TranslateProps {
  fetch: () => void;
}

export const TableRefreshButton: FunctionComponent<TableRefreshButtonProps> = ({
  fetch,
  translate,
}) => (
  <a className="btn btn-light" onClick={fetch}>
    <i className="fa fa-refresh" />
    &nbsp;{translate('Refresh')}
  </a>
);
