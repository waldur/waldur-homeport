import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { CancelTerminationOrderButton } from './CancelTerminationOrderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';

export const ResourceOrderRowActions = ({
  row,
  refetch,
}: {
  row: OrderResponse;
  refetch?(): void;
}) => {
  const user = useUser();
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
