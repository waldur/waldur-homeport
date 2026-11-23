import type { Resource } from 'waldur-js-client';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { LinkArrowLicenseAction } from './LinkArrowLicenseAction';
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
      <LinkArrowLicenseAction row={row} refetch={refetch} />
      <ViewConsumptionHistoryAction row={row} refetch={refetch} />
      <SyncConsumptionHistoryAction row={row} refetch={refetch} />
    </ActionsMenu>
  );
};
