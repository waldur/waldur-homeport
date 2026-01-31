import type { Resource } from 'waldur-js-client';

import { SetBackendIdAction } from '@waldur/marketplace/resources/SetBackendIdAction';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { SyncConsumptionHistoryAction } from './SyncConsumptionHistoryAction';
import { ViewConsumptionHistoryAction } from './ViewConsumptionHistoryAction';

interface ArrowResourcesActionsProps {
  row: Resource;
  refetch: () => void;
}

export const ArrowResourcesActions = ({
  row,
  refetch,
}: ArrowResourcesActionsProps) => {
  return (
    <ActionsDropdownComponent>
      <SetBackendIdAction resource={row} refetch={refetch} />
      <ViewConsumptionHistoryAction row={row} refetch={refetch} />
      <SyncConsumptionHistoryAction row={row} refetch={refetch} />
    </ActionsDropdownComponent>
  );
};
