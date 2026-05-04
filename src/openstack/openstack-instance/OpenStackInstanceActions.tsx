import {
  openstackInstancesSetErred,
  openstackInstancesSetOk,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { ProviderActionsGroup } from '@/marketplace/resources/actions/ProviderActionsGroup';
import { PullMarketplaceResourceAction } from '@/marketplace/resources/actions/PullMarketplaceResourceAction';
import { ChangeLimitsAction } from '@/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@/marketplace/resources/list/ShowUsageAction';
import { SetResourceErredAction } from '@/resource/actions/SetResourceErredAction';
import { SetResourceOkAction } from '@/resource/actions/SetResourceOkAction';
import { UnlinkActionItem } from '@/resource/actions/UnlinkActionItem';

import { ChangeFlavorAction } from './actions/ChangeFlavorAction';
import { ConsoleAction } from './actions/ConsoleAction';
import { ConsoleLogAction } from './actions/ConsoleLogAction';
import { DestroyAction } from './actions/DestroyAction';
import { EditAction } from './actions/EditAction';
import { ForceDestroyAction } from './actions/ForceDestroyAction';
import { PullInstanceAction } from './actions/PullInstanceAction';
import { RescueAction } from './actions/RescueAction';
import { RestartAction } from './actions/RestartAction';
import { StartAction } from './actions/StartAction';
import { StopAction } from './actions/StopAction';
import { UnrescueAction } from './actions/UnrescueAction';
import { UpdateFloatingIpsAction } from './actions/update-floating-ips/UpdateFloatingIpsAction';
import { UpdateSecurityGroupsAction } from './actions/update-security-groups/UpdateSecurityGroupsAction';
import { UnlinkOpenStackInstanceAction } from './UnlinkOpenStackInstanceAction';

export const OpenStackInstanceActions = (props) => (
  <>
    <ActionGroup title={translate('Resource actions')}>
      <StartAction {...props} />
      <StopAction {...props} />
      <RestartAction {...props} />
      <RescueAction {...props} />
      <UnrescueAction {...props} />
      <EditAction {...props} />
      <ChangeFlavorAction {...props} />
      <UpdateSecurityGroupsAction {...props} />
      <UpdateFloatingIpsAction {...props} />
      <ConsoleLogAction {...props} />
      <ConsoleAction {...props} />
      <PullInstanceAction {...props} />
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
      <UnlinkOpenStackInstanceAction {...props} />
      <SetResourceErredAction
        apiMethod={openstackInstancesSetErred}
        resource={props.resource}
        refetch={props.refetch}
      />
      <SetResourceOkAction
        apiMethod={openstackInstancesSetOk}
        resource={props.resource}
        refetch={props.refetch}
      />
    </ActionGroup>

    <ActionGroup title={translate('Dangerous actions')}>
      <DestroyAction {...props} />
      <ForceDestroyAction {...props} />
    </ActionGroup>
  </>
);
