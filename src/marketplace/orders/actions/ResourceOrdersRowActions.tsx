import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { OrderResponse } from '../types';

import { CancelTerminationOrderButton } from './CancelTerminationOrderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';

export const ResourceOrderRowActions = ({
  row,
  refetch,
}: {
  row: OrderResponse;
  refetch?(): void;
}) => {
  const user = useSelector(getUser);
  return (
    user.is_staff && (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[CancelTerminationOrderButton, OrderUnlinkButton].filter(
          Boolean,
        )}
      />
    )
  );
};
