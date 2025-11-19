import { OfferingUserState } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';

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
