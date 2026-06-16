import { OfferingUserState, RuntimeStateEnum } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { DASH_ESCAPE_CODE } from '@/table/constants';

const getStateBadgeVariant = (state: OfferingUserState) => {
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
      return 'default';
  }
};

export const OfferingUserStateField = ({ row }) => (
  <Badge variant={getStateBadgeVariant(row.state)} pill outline>
    {row.state}
  </Badge>
);

const getRuntimeStateBadgeVariant = (state: RuntimeStateEnum) => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Pending account linking':
    case 'Pending additional validation':
      return 'warning';
    default:
      return 'default';
  }
};

export const OfferingUserRuntimeStateField = ({ row }) => {
  if (!row.runtime_state) {
    return <>{DASH_ESCAPE_CODE}</>;
  }

  return (
    <Badge
      variant={getRuntimeStateBadgeVariant(row.runtime_state)}
      pill
      outline
    >
      {row.runtime_state}
    </Badge>
  );
};
