import { FunctionComponent } from 'react';

import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { GridRefreshButton } from './GridRefreshButton';

export const GridButtons: FunctionComponent<any> = (props) => (
  <div className="btn-group">
    <GridRefreshButton {...props} />
    <TableLoadingSpinnerContainer {...props} />
  </div>
);
