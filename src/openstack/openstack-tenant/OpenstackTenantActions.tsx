import {
  openstackTenantsSetErred,
  openstackTenantsSetOk,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { PullMarketplaceResourceAction } from '@/marketplace/resources/actions/PullMarketplaceResourceAction';
import { ChangeLimitsAction } from '@/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@/marketplace/resources/list/ShowUsageAction';
import { RenewAllocationActionAction } from '@/marketplace/resources/renew-allocation/RenewAllocationAction';
import { TerminateAction } from '@/marketplace/resources/terminate/TerminateAction';
import { SetResourceErredAction } from '@/resource/actions/SetResourceErredAction';
import { SetResourceOkAction } from '@/resource/actions/SetResourceOkAction';
import { UnlinkActionItem } from '@/resource/actions/UnlinkActionItem';

import { ProviderActionsGroup } from '../../marketplace/resources/actions/ProviderActionsGroup';

import { EditAction } from './actions/EditAction';
import { MigrateTenantAction } from './actions/MigrateTenantAction';
import { PullTenantAction } from './actions/PullTenantAction';

export const OpenstackTenantActions = (props) => (
  <>
    <ActionGroup title={translate('Resource actions')}>
      <EditAction {...props} />
      <MigrateTenantAction {...props} />
      <PullTenantAction {...props} />
      <PullMarketplaceResourceAction {...props} />
    </ActionGroup>

    <ActionGroup title={translate('Billing actions')}>
      <ChangePlanAction {...props} />
      <ChangeLimitsAction {...props} />
      <RenewAllocationActionAction {...props} />
      <ShowUsageAction {...props} />
    </ActionGroup>

    <ProviderActionsGroup {...props} />

    <ActionGroup title={translate('Staff actions')}>
      <MoveResourceAction {...props} />
      <UnlinkActionItem {...props} />
      <SetResourceErredAction
        apiMethod={openstackTenantsSetErred}
        resource={props.resource}
        refetch={props.refetch}
      />
      <SetResourceOkAction
        apiMethod={openstackTenantsSetOk}
        resource={props.resource}
        refetch={props.refetch}
      />
    </ActionGroup>

    <ActionGroup title={translate('Dangerous actions')}>
      <TerminateAction {...props} />
    </ActionGroup>
  </>
);
