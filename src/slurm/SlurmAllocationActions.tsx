import { translate } from '@/i18n';
import { ActionGroup } from '@/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@/marketplace/resources/actions/MoveResourceAction';
import { ProviderActionsGroup } from '@/marketplace/resources/actions/ProviderActionsGroup';
import { ChangePlanAction } from '@/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@/marketplace/resources/terminate/TerminateAction';
import { UnlinkActionItem } from '@/resource/actions/UnlinkActionItem';

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
