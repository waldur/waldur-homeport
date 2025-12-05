import { FunctionComponent } from 'react';

import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface ChangedLimitFieldProps {
  changedLimit: number;
}

export const ChangedLimitField: FunctionComponent<ChangedLimitFieldProps> = ({
  changedLimit,
}) => {
  return (
    <ChangesAmountBadge
      changes={changedLimit}
      badgePill
      badgeOutline
      keepDecimals
      showSign
      showOnZero
      unit={null}
    />
  );
};
