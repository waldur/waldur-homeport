import { FunctionComponent } from 'react';

import { Badge } from '@waldur/core/Badge';

const getColor = (value) =>
  value === null
    ? 'primary'
    : value < 0.6
      ? 'warning'
      : value < 0.8
        ? 'danger'
        : 'success';

export const PlanRemainingColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Badge variant={getColor(row.remaining)} outline pill>
    {row.remaining === null ? 'N/A' : row.remaining}
  </Badge>
);
