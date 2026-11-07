import { FC, useMemo } from 'react';

import { Badge, BadgeProps } from 'waldur-ui';

interface AssignmentBatchStatusBadgeProps {
  status: string;
  statusDisplay: string;
  size?: BadgeProps['size'];
}

export const AssignmentBatchStatusBadge: FC<
  AssignmentBatchStatusBadgeProps
> = ({ status, statusDisplay, size }) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'draft':
        return 'neutral';
      case 'sent':
        return 'info';
      case 'responded':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  }, [status]);

  return (
    <Badge variant={variant} size={size} shape="pill" tone="outline">
      {statusDisplay}
    </Badge>
  );
};
