import { FC, useMemo } from 'react';

import { Badge } from '@/core/Badge';

interface AssignmentBatchStatusBadgeProps {
  status: string;
  statusDisplay: string;
}

export const AssignmentBatchStatusBadge: FC<
  AssignmentBatchStatusBadgeProps
> = ({ status, statusDisplay }) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'primary';
      case 'responded':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};
