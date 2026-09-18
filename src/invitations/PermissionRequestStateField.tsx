import {
  CheckIcon,
  ClockCountdownIcon,
  Icon,
  XIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { PermissionRequest } from 'waldur-js-client';

import { Badge, BadgeVariant } from 'waldur-ui';

import { translate } from '@/i18n';

const requestStatus: Record<
  string,
  { label: string; color: BadgeVariant; icon: Icon }
> = {
  pending: {
    label: translate('Pending'),
    color: 'warning',
    icon: ClockCountdownIcon,
  },
  approved: { label: translate('Accepted'), color: 'success', icon: CheckIcon },
  rejected: { label: translate('Declined'), color: 'danger', icon: XIcon },
  canceled: { label: translate('Canceled'), color: 'danger', icon: XIcon },
};

export const PermissionRequestStateField: FC<{
  row: Pick<PermissionRequest, 'state'>;
}> = ({ row }) => {
  const status = requestStatus[row.state];

  return (
    <Badge
      variant={status?.color || 'neutral'}
      leftIcon={status ? <status.icon weight="bold" /> : null}
      shape="pill"
      tone="outline"
    >
      {status?.label || row.state}
    </Badge>
  );
};
