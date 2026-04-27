import { DropdownDivider } from 'react-bootstrap';
import { Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { useUser } from '@/workspace/hooks';

import { MultiDestroyAction } from './MultiDestroyAction';
import { MultiEditOptionsAction } from './MultiEditOptionsAction';
import { MultiMoveAction } from './MultiMoveAction';
import { MultiPlacementMapAction } from './MultiPlacementMapAction';
import { MultiPullAction } from './MultiPullAction';
import { MultiRenewAllocationsAction } from './MultiRenewAllocationsAction';
import { MultiRestartAction } from './MultiRestartAction';
import { MultiSetDownscaledAction } from './MultiSetDownscaledAction';
import { MultiSetErredAction } from './MultiSetErredAction';
import { MultiSetPausedAction } from './MultiSetPausedAction';
import { MultiStartAction } from './MultiStartAction';
import { MultiStopAction } from './MultiStopAction';
import { MultiUnlinkAction } from './MultiUnlinkAction';

export const ResourceMultiSelectAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => {
  const user = useUser();
  return (
    <ActionDropdownButton variant="primary" title={translate('All actions')}>
      <MultiRenewAllocationsAction rows={rows} refetch={refetch} />
      <MultiEditOptionsAction rows={rows} refetch={refetch} />
      <MultiStopAction rows={rows} refetch={refetch} />
      <MultiStartAction rows={rows} refetch={refetch} />
      <MultiRestartAction rows={rows} refetch={refetch} />
      <MultiPullAction rows={rows} refetch={refetch} />
      <MultiMoveAction rows={rows} refetch={refetch} />
      <DropdownDivider className="border-top m-0" />
      <MultiDestroyAction rows={rows} refetch={refetch} />
      {user.is_staff && (
        <>
          <DropdownDivider className="border-top m-0" />
          <MultiPlacementMapAction rows={rows} />
          <MultiSetDownscaledAction rows={rows} refetch={refetch} />
          <MultiSetPausedAction rows={rows} refetch={refetch} />
          <MultiSetErredAction rows={rows} refetch={refetch} />
          <MultiUnlinkAction rows={rows} refetch={refetch} />
        </>
      )}
    </ActionDropdownButton>
  );
};
