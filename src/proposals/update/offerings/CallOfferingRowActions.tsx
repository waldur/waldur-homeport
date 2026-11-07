import { RequestedOffering } from 'waldur-js-client';

import { CallOfferingDeleteButton } from '@/proposals/details/CallOfferingDeleteButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';

export const CallOfferingRowActions = ({
  row,
  callUuid,
  refetch,
}: {
  row: RequestedOffering;
  callUuid: string;
  refetch(): void;
}) => (
  <ActionsDropdown row={row} refetch={refetch}>
    <CallOfferingDeleteButton row={row} callUuid={callUuid} refetch={refetch} />
  </ActionsDropdown>
);
