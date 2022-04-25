import { FunctionComponent } from 'react';

import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<any> = (props) => (
  <>
    {props.rows.length > 0 && props.enableExport && (
      <TableExportButton {...props} />
    )}
    {props.actions}
    <TableRefreshButton {...props} />
    <TableLoadingSpinnerContainer {...props} />
  </>
);
