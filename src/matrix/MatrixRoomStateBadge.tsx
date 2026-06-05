import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

export const ROOM_STATE_VARIANT: Record<string, string> = {
  creating: 'blue',
  active: 'success',
  disabling: 'warning',
  archived: 'default',
  error: 'danger',
};

const stateLabel = (state: string) => {
  switch (state) {
    case 'creating':
      return translate('Creating');
    case 'active':
      return translate('Active');
    case 'disabling':
      return translate('Disabling');
    case 'archived':
      return translate('Archived');
    case 'error':
      return translate('Error');
    default:
      return state;
  }
};

interface MatrixRoomStateBadgeProps {
  state: string;
  errorMessage?: string;
}

export const MatrixRoomStateBadge: FC<MatrixRoomStateBadgeProps> = ({
  state,
  errorMessage,
}) => {
  const variant = ROOM_STATE_VARIANT[state] || 'default';
  const badge = (
    <Badge variant={variant} pill outline>
      {stateLabel(state)}
    </Badge>
  );
  if (state === 'error' && errorMessage) {
    return (
      <Tip id="matrix-room-error" label={errorMessage}>
        {badge}
      </Tip>
    );
  }
  return badge;
};
