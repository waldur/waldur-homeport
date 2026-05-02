import { ProviderRequestedOffering } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AcceptOfferingRequestAction } from './AcceptOfferingRequestAction';
import { RejectOfferingRequestAction } from './RejectOfferingRequestAction';

interface OfferingRequestItemActionsProps {
  row: ProviderRequestedOffering;
  fetch;
}

export const OfferingRequestItemActions = ({
  row,
  fetch,
}: OfferingRequestItemActionsProps) => {
  return row.state === 'requested' ? (
    <ActionsDropdown row={row} refetch={fetch}>
      <AcceptOfferingRequestAction row={row} refetch={fetch} />
      <RejectOfferingRequestAction row={row} refetch={fetch} />
    </ActionsDropdown>
  ) : null;
};
