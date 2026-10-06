import type { Resource } from 'waldur-js-client';

import { SetBackendIdAction } from '@/marketplace/resources/SetBackendIdAction';
import { ActionsMenu } from '@/table/ActionsDropdown';

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
    <ActionsMenu>
      <SetBackendIdAction resource={row} refetch={refetch} />
      <ViewConsumptionHistoryAction row={row} refetch={refetch} />
      <SyncConsumptionHistoryAction row={row} refetch={refetch} />
    </ActionsMenu>
  );
};
