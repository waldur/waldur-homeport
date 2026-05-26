import { TimerIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useModalDialogCallback } from '@/resource/actions/useModalDialogCallback';
import { useValidators } from '@/resource/actions/useValidators';
import { useUser } from '@/workspace/hooks';

import { useResourceOffering } from '../actions/useResourceOffering';
import { getMarketplaceResourceUuid } from '../actions/utils';
import { hasEditableLimitComponents } from '../change-limits/utils';

const RequestLimitsChangeFlowDialog = lazyComponent(() =>
  import('./RequestLimitsChangeFlowDialog').then((module) => ({
    default: module.RequestLimitsChangeFlowDialog,
  })),
);

const validators = [validateState('OK')];

const useRequestLimitsChange = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    RequestLimitsChangeFlowDialog,
    resource,
    { refetch },
    { size: 'xl', fullscreen: 'lg-down', contentClassName: 'overflow-auto' },
  );
  return { action, tooltip, disabled };
};

export const RequestLimitsChangeAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const { action, tooltip, disabled } = useRequestLimitsChange({
    resource,
    refetch,
  });

  const canUpdateDirectly =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    }) ||
    user?.is_staff ||
    user?.is_support;

  const hasPlan = Boolean(resource.plan_uuid || resource.marketplace_plan_uuid);
  const resourceUuid = getMarketplaceResourceUuid(resource);
  const offering = useResourceOffering(
    resourceUuid,
    !canUpdateDirectly && hasPlan,
  );

  if (canUpdateDirectly) {
    return null;
  }

  if (!resourceUuid) {
    return null;
  }

  // Hide when the offering is intrinsically not configured for editable limits.
  if (offering && !hasEditableLimitComponents(offering)) {
    return null;
  }

  const disabledReason = !hasPlan
    ? translate('Resource is not associated with a plan.')
    : undefined;

  // State-based tooltip (from validators) takes precedence over the plan reason,
  // mirroring ChangeLimitsAction.
  return (
    <ActionItem
      title={translate('Request limit change')}
      action={action}
      tooltip={disabledReason ? tooltip || disabledReason : tooltip}
      disabled={disabled || Boolean(disabledReason)}
      iconNode={<TimerIcon weight="bold" />}
      resource={resource}
      {...rest}
    />
  );
};
