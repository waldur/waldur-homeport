import { CheckIcon, ClockCountdownIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

const requestStatus = {
  pending: {
    label: translate('Pending'),
    color: 'warning',
    icon: ClockCountdownIcon,
  },
  approved: { label: translate('Accepted'), color: 'success', icon: CheckIcon },
  rejected: { label: translate('Declined'), color: 'danger', icon: XIcon },
  canceled: { label: translate('Canceled'), color: 'danger', icon: XIcon },
};

export const PermissionRequestStateField: FC<{ row }> = ({ row }) => {
  const status = requestStatus[row.state];

  return (
    <Badge
      variant={status?.color || 'default'}
      leftIcon={status ? <status.icon weight="bold" /> : null}
      pill
      outline
    >
      {status?.label || row.state}
    </Badge>
  );
};
