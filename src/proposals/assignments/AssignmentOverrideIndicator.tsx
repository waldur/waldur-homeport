import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const AssignmentOverrideIndicator: FC<{
  overrideReason: string;
  overriddenBy?: string;
  uuid?: string;
}> = ({ overrideReason, overriddenBy }) => (
  <Tooltip
    label={
      overriddenBy
        ? translate('Overridden by {user}: {reason}', {
            user: overriddenBy,
            reason: overrideReason,
          })
        : translate('Override reason: {reason}', {
            reason: overrideReason,
          })
    }
  >
    <Badge
      variant="warning"
      leftIcon={<ShieldWarningIcon size={14} weight="bold" />}
      tone="outline"
    >
      {translate('Overridden')}
    </Badge>
  </Tooltip>
);
