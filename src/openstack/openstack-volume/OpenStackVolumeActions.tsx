import {
  openstackVolumesSetErred,
  openstackVolumesSetOk,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { ProviderActionsGroup } from '@/marketplace/resources/actions/ProviderActionsGroup';
import { PullMarketplaceResourceAction } from '@/marketplace/resources/actions/PullMarketplaceResourceAction';
import { ChangeLimitsAction } from '@/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@/marketplace/resources/terminate/TerminateAction';
import { SetResourceErredAction } from '@/resource/actions/SetResourceErredAction';
import { SetResourceOkAction } from '@/resource/actions/SetResourceOkAction';
import { UnlinkActionItem } from '@/resource/actions/UnlinkActionItem';

import { AttachAction } from './actions/AttachAction';
import { DetachAction } from './actions/DetachAction';
import { EditAction } from './actions/EditAction';
import { ExtendAction } from './actions/ExtendAction';
import { PullAction } from './actions/PullAction';
import { RetypeAction } from './actions/RetypeAction';

export const OpenstackVolumeActions = (props) => (
  <>
    <ActionGroup title={translate('Resource actions')}>
      <EditAction {...props} />
      <AttachAction {...props} />
      <DetachAction {...props} />
      <ExtendAction {...props} />
      <RetypeAction {...props} />
      <PullAction {...props} />
      <PullMarketplaceResourceAction {...props} />
    </ActionGroup>

    <ActionGroup title={translate('Billing actions')}>
      <ChangePlanAction {...props} />
      <ChangeLimitsAction {...props} />
      <ShowUsageAction {...props} />
    </ActionGroup>

    <ProviderActionsGroup {...props} />

    <ActionGroup title={translate('Staff actions')}>
      <MoveResourceAction {...props} />
      <UnlinkActionItem {...props} />
      <SetResourceErredAction
        apiMethod={openstackVolumesSetErred}
        resource={props.resource}
        refetch={props.refetch}
      />
      <SetResourceOkAction
        apiMethod={openstackVolumesSetOk}
        resource={props.resource}
        refetch={props.refetch}
      />
    </ActionGroup>

    <ActionGroup title={translate('Dangerous actions')}>
      <TerminateAction {...props} />
    </ActionGroup>
  </>
);
