import { GaugeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getCappedComponents } from '@/marketplace/common/spendingLimits';
import {
  findResourcePlan,
  getEffectiveComponents,
} from '@/marketplace/details/plan/effectiveComponents';
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

const SetSpendingLimitsDialog = lazyComponent(() =>
  import('./SetSpendingLimitsDialog').then((module) => ({
    default: module.SetSpendingLimitsDialog,
  })),
);

// The states the backend accepts limits in: a resource being provisioned may
// get them before it is ready, one being terminated has no use for them.
const validators = [validateState('Creating', 'OK', 'Erred', 'Updating')];

/**
 * Replaces the resource's spending limits directly, with no order and no
 * provider approval. Offered when a component of the offering takes spending
 * limits under the resource's plan, or when the resource still holds limits
 * the provider no longer offers: those stay in force until removed.
 */
export const SetSpendingLimitsAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    SetSpendingLimitsDialog,
    resource,
    { refetch },
    { size: 'lg' },
  );
  const resourceUuid = getMarketplaceResourceUuid(resource);
  const canSetLimits = hasPermission(user, {
    permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });
  // Fetched only for users who may use the action.
  const offering = useResourceOffering(resourceUuid, canSetLimits);

  if (!canSetLimits) {
    return null;
  }

  const planUuid = resource.plan_uuid || resource.marketplace_plan_uuid;
  const holdsLimits = Object.keys(resource.spending_limits || {}).length > 0;
  if (
    !offering ||
    (!holdsLimits &&
      getCappedComponents(
        getEffectiveComponents(
          offering,
          findResourcePlan(offering.plans, planUuid),
        ),
      ).length === 0)
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Change spending limits')}
      action={action}
      tooltip={tooltip}
      disabled={disabled}
      iconNode={<GaugeIcon weight="bold" />}
      resource={resource}
      {...rest}
    />
  );
};
