import { FC, useMemo } from 'react';

import { Badge } from 'waldur-ui';

export const AssignmentStatusBadge: FC<{
  status: string;
  statusDisplay: string;
}> = ({ status, statusDisplay }) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'danger';
      case 'coi_blocked':
        return 'info';
      case 'expired':
        return 'secondary';
      case 'reassigned':
        return 'primary';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} shape="pill" tone="outline">
      {statusDisplay}
    </Badge>
  );
};
