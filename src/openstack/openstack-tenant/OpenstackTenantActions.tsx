import { translate } from '@waldur/i18n';
import { ActionGroup } from '@waldur/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@waldur/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

import { ProviderActionsGroup } from '../../marketplace/resources/actions/ProviderActionsGroup';

import { EditAction } from './actions/EditAction';
import { PullTenantAction } from './actions/PullTenantAction';
import { RequestDirectAccessAction } from './actions/RequestDirectAccessAction';

export const OpenstackTenantActions = (props) => (
  <>
    <ActionGroup title={translate('Resource actions')}>
      <EditAction {...props} />
      <RequestDirectAccessAction {...props} />
    </ActionGroup>

    <ActionGroup title={translate('Billing actions')}>
      <PullTenantAction {...props} />
      <ChangePlanAction {...props} />
      <ChangeLimitsAction {...props} />
      <ShowUsageAction {...props} />
    </ActionGroup>

    <ProviderActionsGroup {...props} />

    <ActionGroup title={translate('Staff actions')}>
      <MoveResourceAction {...props} />
      <UnlinkActionItem {...props} />
    </ActionGroup>

    <ActionGroup title={translate('Dangerous actions')}>
      <TerminateAction {...props} />
    </ActionGroup>
  </>
);
