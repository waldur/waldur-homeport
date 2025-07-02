import { translate } from '@waldur/i18n';
import { ActionGroup } from '@waldur/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ProviderActionsGroup } from '@waldur/marketplace/resources/actions/ProviderActionsGroup';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@waldur/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

import { EditAction } from './EditAction';
import { PullAllocationAction } from './PullAllocationAction';
import { RequestLimitsChangeAction } from './RequestLimitsChangeAction';
import { SetLimitsAction } from './SetLimitsAction';

export const SlurmAllocationActions = (props) => (
  <>
    <ActionGroup title={translate('Resource actions')}>
      <EditAction {...props} />
      <PullAllocationAction {...props} />
    </ActionGroup>

    <ActionGroup title={translate('Billing actions')}>
      <ChangePlanAction {...props} />
      <ShowUsageAction {...props} />
      <RequestLimitsChangeAction {...props} />
      <SetLimitsAction {...props} />
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
