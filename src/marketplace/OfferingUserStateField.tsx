import { OfferingUserState, RuntimeStateEnum } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { DASH_ESCAPE_CODE } from '@/table/constants';

const getStateBadgeVariant = (state: OfferingUserState): BadgeVariant => {
  switch (state) {
    case 'Creating':
      return 'blue';
    case 'Pending account linking':
    case 'Pending additional validation':
    case 'Requested deletion':
      return 'warning';
    case 'OK':
      return 'success';
    case 'Error creating':
    case 'Error deleting':
    case 'Deleting':
    case 'Deleted':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const OfferingUserStateField = ({ row }) => (
  <Badge variant={getStateBadgeVariant(row.state)} shape="pill" tone="outline">
    {row.state}
  </Badge>
);

const getRuntimeStateBadgeVariant = (state: RuntimeStateEnum): BadgeVariant => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Pending account linking':
    case 'Pending additional validation':
      return 'warning';
    default:
      return 'neutral';
  }
};

export const OfferingUserRuntimeStateField = ({ row }) => {
  if (!row.runtime_state) {
    return <>{DASH_ESCAPE_CODE}</>;
  }

  return (
    <Badge
      variant={getRuntimeStateBadgeVariant(row.runtime_state)}
      shape="pill"
      tone="outline"
    >
      {row.runtime_state}
    </Badge>
  );
};
