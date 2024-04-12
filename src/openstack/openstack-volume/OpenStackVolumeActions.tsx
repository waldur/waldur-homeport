import { translate } from '@waldur/i18n';
import { ActionGroup } from '@waldur/marketplace/resources/actions/ActionGroup';
import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ProviderActionsGroup } from '@waldur/marketplace/resources/actions/ProviderActionsGroup';
import { ChangeLimitsAction } from '@waldur/marketplace/resources/change-limits/ChangeLimitsAction';
import { ChangePlanAction } from '@waldur/marketplace/resources/change-plan/ChangePlanAction';
import { ShowUsageAction } from '@waldur/marketplace/resources/list/ShowUsageAction';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { UnlinkActionItem } from '@waldur/resource/actions/UnlinkActionItem';

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
    </ActionGroup>

    <ActionGroup title={translate('Billing actions')}>
      <PullAction {...props} />
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
