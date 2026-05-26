import { FunctionComponent } from 'react';

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
    return <span className="text-muted">{changedLimit}</span>;
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
