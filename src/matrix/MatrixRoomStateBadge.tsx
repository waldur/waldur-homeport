import { FC } from 'react';

import { BadgeVariant, Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const ROOM_STATE_VARIANT: Record<string, BadgeVariant> = {
  creating: 'blue',
  active: 'success',
  disabling: 'warning',
  archived: 'neutral',
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
  const variant = ROOM_STATE_VARIANT[state] || 'neutral';
  const badge = (
    <Badge variant={variant} shape="pill" tone="outline">
      {stateLabel(state)}
    </Badge>
  );
  if (state === 'error' && errorMessage) {
    return (
      <Tooltip label={errorMessage}>
        <span>{badge}</span>
      </Tooltip>
    );
  }
  return badge;
};
