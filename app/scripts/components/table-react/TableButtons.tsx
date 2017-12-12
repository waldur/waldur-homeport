import * as React from 'react';

import TableExportButton from './TableExportButton';
import TableRefreshButton from './TableRefreshButton';

const TableButtons = props => (
  <div className="pull-right">
    <div className="btn-group">
      <TableExportButton {...props}/>
      {props.actions}
      <TableRefreshButton {...props}/>
    </div>
  </div>
);

export default TableButtons;
