import { FC } from 'react';

import { HelpIcon } from 'waldur-ui';
import { Badge } from 'waldur-ui';

export const getInvitationStatusVariant = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'pending':
      return 'warning';
    case 'declined':
      return 'danger';
    case 'expired':
      return 'secondary';
    default:
      return 'primary';
  }
};

interface InvitationStatusBadgeProps {
  status: string;
  statusDisplay: string;
  /**
   * Explains a pending invitation to someone waiting on it. The reviewer pool
   * passes one for the call manager; a reviewer reading their own invitation
   * needs none, so it is left out there.
   */
  pendingHint?: string;
}

export const InvitationStatusBadge: FC<InvitationStatusBadgeProps> = ({
  status,
  statusDisplay,
  pendingHint,
}) => (
  <Badge
    variant={getInvitationStatusVariant(status)}
    rightIcon={
      status === 'pending' && pendingHint ? (
        <HelpIcon label={pendingHint} size={14} />
      ) : undefined
    }
    shape="pill"
    tone="outline"
  >
    {statusDisplay}
  </Badge>
);
