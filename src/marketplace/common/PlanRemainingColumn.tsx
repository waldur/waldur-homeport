import { FunctionComponent } from 'react';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

const getColor = (value): BadgeVariant =>
  value === null
    ? 'neutral'
    : value < 0.6
      ? 'warning'
      : value < 0.8
        ? 'danger'
        : 'success';

export const PlanRemainingColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Badge variant={getColor(row.remaining)} shape="pill" tone="outline">
    {row.remaining === null ? 'N/A' : row.remaining}
  </Badge>
);
