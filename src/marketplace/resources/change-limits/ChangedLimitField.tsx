import { FunctionComponent } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface ChangedLimitFieldProps {
  changedLimit: number;
  unit?: string;
}

export const ChangedLimitField: FunctionComponent<ChangedLimitFieldProps> = ({
  changedLimit,
  unit,
}) => {
  if (changedLimit === 0) {
    return (
      <Badge variant="neutral" size="sm" shape="pill" tone="outline">
        {translate('No change')}
      </Badge>
    );
  }

  return (
    <ChangesAmountBadge
      changes={changedLimit}
      badgePill
      badgeOutline
      unit={unit ? ' ' + unit : ''}
      keepDecimals
      badgeSm
      showSign
    />
  );
};
