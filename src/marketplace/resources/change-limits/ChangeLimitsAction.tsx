import { TimerIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasAllPermissions } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useModalDialogCallback } from '@/resource/actions/useModalDialogCallback';
import { useValidators } from '@/resource/actions/useValidators';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';
import { useResourceOffering } from '../actions/useResourceOffering';
import { getMarketplaceResourceUuid } from '../actions/utils';

import { hasEditableLimitComponents } from './utils';

const ChangeLimitsDialog = lazyComponent(() =>
  import('./ChangeLimitsDialog').then((module) => ({
    default: module.ChangeLimitsDialog,
  })),
);

const validators = [validateState('OK')];

const useChangeLimits = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    ChangeLimitsDialog,
    resource,
    { refetch },
    { size: 'xl', fullscreen: 'lg-down', contentClassName: 'overflow-auto' },
  );
  return {
    title: translate('Change limits'),
    action,
    tooltip,
    disabled,
    iconNode: <TimerIcon weight="bold" />,
    important: true,
    actionId: ResourceAction.UPDATE_LIMITS,
    resource,
  };
};

export const ChangeLimitsAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const buttonProps = useChangeLimits({ resource, refetch });

  // Changing limits submits a marketplace order, so it needs order creation
  // rights on top of the limits permission.
  if (
    !hasAllPermissions(
      user,
      [PermissionEnum.UPDATE_RESOURCE_LIMITS, PermissionEnum.CREATE_ORDER],
      {
        projectId: resource.project_uuid,
        customerId: resource.customer_uuid,
      },
    )
  ) {
    return null;
  }

  const hasPlan = Boolean(resource.plan_uuid || resource.marketplace_plan_uuid);

  const resourceUuid = getMarketplaceResourceUuid(resource);
  const offering = useResourceOffering(resourceUuid, hasPlan);

  // Hide when the offering is intrinsically not configured for editable limits.
  if (offering && !hasEditableLimitComponents(offering)) {
    return null;
  }

  const disabledReason = !hasPlan
    ? translate('Resource is not associated with a plan.')
    : undefined;

  // State-based tooltip (from validators) takes precedence over offering-level reasons.
  const finalProps = disabledReason
    ? {
        ...buttonProps,
        disabled: true,
        tooltip: buttonProps.tooltip || disabledReason,
      }
    : buttonProps;

  return <ActionItem {...finalProps} {...rest} />;
};
