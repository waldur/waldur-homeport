import { Resource } from 'waldur-js-client';

import { ButtonSize, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { MultiChangeLimitsAction } from './MultiChangeLimitsAction';
import { MultiEditOptionsAction } from './MultiEditOptionsAction';
import { MultiMoveAction } from './MultiMoveAction';
import { MultiPlacementMapAction } from './MultiPlacementMapAction';
import { MultiPullAction } from './MultiPullAction';
import { MultiRenewAllocationsAction } from './MultiRenewAllocationsAction';
import { MultiRestartAction } from './MultiRestartAction';
import { MultiSetDownscaledAction } from './MultiSetDownscaledAction';
import { MultiSetEndDateAction } from './MultiSetEndDateAction';
import { MultiSetErredAction } from './MultiSetErredAction';
import { MultiSetPausedAction } from './MultiSetPausedAction';
import { MultiStartAction } from './MultiStartAction';
import { MultiStopAction } from './MultiStopAction';
import { MultiTerminateAction } from './MultiTerminateAction';
import { MultiUnlinkAction } from './MultiUnlinkAction';

export const ResourceMultiSelectAction = ({
  rows,
  refetch,
  size,
}: {
  rows: Resource[];
  refetch(): void;
  size?: ButtonSize;
}) => {
  const user = useUser();
  return (
    <Menu>
      <Menu.TriggerButton variant="primary" size={size}>
        {translate('All actions')}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        <MultiRenewAllocationsAction rows={rows} refetch={refetch} />
        <MultiChangeLimitsAction rows={rows} refetch={refetch} />
        <MultiSetEndDateAction rows={rows} refetch={refetch} />
        <MultiEditOptionsAction rows={rows} refetch={refetch} />
        <MultiStopAction rows={rows} refetch={refetch} />
        <MultiStartAction rows={rows} refetch={refetch} />
        <MultiRestartAction rows={rows} refetch={refetch} />
        <MultiPullAction rows={rows} refetch={refetch} />
        <MultiMoveAction rows={rows} refetch={refetch} />
        <Menu.Separator className="border-top m-0" />
        <MultiTerminateAction rows={rows} refetch={refetch} />
        {user.is_staff && (
          <>
            <Menu.Separator className="border-top m-0" />
            <MultiPlacementMapAction rows={rows} />
            <MultiSetDownscaledAction rows={rows} refetch={refetch} />
            <MultiSetPausedAction rows={rows} refetch={refetch} />
            <MultiSetErredAction rows={rows} refetch={refetch} />
            <MultiUnlinkAction rows={rows} refetch={refetch} />
          </>
        )}
      </Menu.Content>
    </Menu>
  );
};
