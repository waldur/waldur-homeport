import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface TableRefreshButtonProps {
  fetch: () => void;
}

export const TableRefreshButton: FunctionComponent<TableRefreshButtonProps> = ({
  fetch,
}) => (
  <Button variant="light" onClick={fetch}>
    <i className="fa fa-refresh" />
    {translate('Refresh')}
  </Button>
);
