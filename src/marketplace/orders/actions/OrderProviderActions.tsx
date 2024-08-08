import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { OrderResponse } from '../types';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';
import { RejectByProviderButton } from './RejectByProviderButton';

export const OrderProviderActions = ({
  row,
  refetch,
}: {
  row: OrderResponse;
  refetch?(): void;
}) => {
  const user = useSelector(getUser);
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        row.state === 'pending-provider' ? ApproveByProviderButton : null,
        row.state === 'pending-provider' ? RejectByProviderButton : null,
        user.is_staff ? OrderUnlinkButton : null,
      ].filter(Boolean)}
      data-cy="public-resources-list-actions-dropdown-btn"
    />
  );
};
