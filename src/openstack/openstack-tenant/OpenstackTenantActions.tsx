import {
  openstackTenantsSetErred,
  openstackTenantsSetOk,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionGroup } from '@waldur/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@waldur/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { SetResourceErredAction } from '@waldur/resource/actions/SetResourceErredAction';
import { SetResourceOkAction } from '@waldur/resource/actions/SetResourceOkAction';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

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
