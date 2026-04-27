import { FunctionComponent } from 'react';

import { Badge } from '@/core/Badge';

const getColor = (value) =>
  value === null
    ? 'gray'
    : value < 0.6
      ? 'warning'
      : value < 0.8
        ? 'danger'
        : 'success';

export const PlanRemainingColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Badge variant={getColor(row.remaining)} pill outline>
    {row.remaining === null ? 'N/A' : row.remaining}
  </Badge>
);
