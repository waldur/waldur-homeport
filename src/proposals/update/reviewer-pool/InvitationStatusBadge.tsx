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
    default:
      return 'neutral';
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
  /** Why the invitation was declined, inside the badge as the pending hint is. */
  declinedHint?: string;
}

export const InvitationStatusBadge: FC<InvitationStatusBadgeProps> = ({
  status,
  statusDisplay,
  pendingHint,
  declinedHint,
}) => {
  const hint =
    status === 'pending'
      ? pendingHint
      : status === 'declined'
        ? declinedHint
        : undefined;
  return (
    <Badge
      variant={getInvitationStatusVariant(status)}
      rightIcon={hint ? <HelpIcon label={hint} size={14} /> : undefined}
      shape="pill"
      tone="outline"
    >
      {statusDisplay}
    </Badge>
  );
};
