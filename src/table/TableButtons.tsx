import { FunctionComponent } from 'react';

import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

export const TableButtons: FunctionComponent<any> = (props) => (
  <div className="pull-right">
    <div className="btn-group">
      {props.rows.length > 0 && props.enableExport && (
        <TableExportButton {...props} />
      )}
      {props.actions}
      <TableRefreshButton {...props} />
      <TableLoadingSpinnerContainer {...props} />
    </div>
  </div>
);
