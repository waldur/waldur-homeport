import React, { FunctionComponent } from 'react';

import { ServiceProvider } from '@waldur/marketplace/types';
import './GridBody.scss';

interface GridBodyProps {
  rows: any[];
  gridItemComponent: React.ComponentType<{ row: any }>;
}

export const GridBody: FunctionComponent<GridBodyProps> = ({
  rows,
  gridItemComponent,
}) => (
  <div className="gridBody">
    {rows.map((row: ServiceProvider, index: number) =>
      React.createElement(gridItemComponent, { key: index, row }),
    )}
  </div>
);
