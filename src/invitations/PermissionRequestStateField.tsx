import { CheckIcon, ClockCountdownIcon, XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

const requestStatus = {
  pending: {
    label: translate('Pending'),
    color: 'warning',
    icon: ClockCountdownIcon,
  },
  approved: { label: translate('Accepted'), color: 'success', icon: CheckIcon },
  rejected: { label: translate('Declined'), color: 'danger', icon: XIcon },
};

export const PermissionRequestStateField: FC<{ row }> = ({ row }) => {
  const status = requestStatus[row.state];
  return (
    <Badge
      variant={status.color}
      leftIcon={<status.icon weight="bold" />}
      outline
      pill
    >
      {status.label}
    </Badge>
  );
};
