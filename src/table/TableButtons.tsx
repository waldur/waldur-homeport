import { FunctionComponent } from 'react';

import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<any> = (props) => (
  <>
    {props.actions}
    {props.rows.length > 0 && props.enableExport && (
      <TableExportButton {...props} />
    )}
    <TableRefreshButton {...props} />
    <TableLoadingSpinnerContainer {...props} />
  </>
);
