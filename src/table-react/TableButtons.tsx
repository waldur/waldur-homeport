import * as React from 'react';

import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

export const TableButtons = props => (
  <div className="pull-right">
    <div className="btn-group">
      {props.rows.length > 0 && props.enableExport && <TableExportButton {...props}/>}
      {props.actions}
      <TableRefreshButton {...props}/>
    </div>
  </div>
);
