import { Badge } from '@waldur/core/Badge';

import { formatInvitationState } from './InvitationStateFilter';

export const InvitationStateBadge = ({ state }: { state: string }) => {
  const formattedState = formatInvitationState(state);
  const colorMap = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
  };
  const color = colorMap[state] || 'default';
  return (
    <Badge variant={color} pill outline>
      {formattedState}
    </Badge>
  );
};
