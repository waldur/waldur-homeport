import { FC } from 'react';

import { Badge, BadgeProps } from 'waldur-ui';

import { translate } from '@/i18n';

const getAssignmentStatusVariant = (status: string) => {
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
    case 'reassigned':
    default:
      return 'neutral';
  }
};

interface AssignmentStatusBadgeProps {
  status: string;
  statusDisplay: string;
  /**
   * The status of the item's batch. An item of a batch not sent yet is
   * pending, but nobody has been asked, so it does not await a response.
   */
  batchStatus?: string;
  size?: BadgeProps['size'];
}

export const AssignmentStatusBadge: FC<AssignmentStatusBadgeProps> = ({
  status,
  statusDisplay,
  batchStatus,
  size,
}) => {
  const notSent = status === 'pending' && batchStatus === 'draft';
  return (
    <Badge
      variant={notSent ? 'neutral' : getAssignmentStatusVariant(status)}
      size={size}
      shape="pill"
      tone="outline"
    >
      {notSent ? translate('Not sent yet') : statusDisplay}
    </Badge>
  );
};
