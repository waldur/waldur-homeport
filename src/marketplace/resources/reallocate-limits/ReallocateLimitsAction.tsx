import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';
import { useUser } from '@waldur/workspace/hooks';

const ReallocateLimitsDialog = lazyComponent(() =>
  import('./ReallocateLimitsDialog').then((module) => ({
    default: module.ReallocateLimitsDialog,
  })),
);

const validators = [validateState('OK')];

const useReallocateLimits = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    ReallocateLimitsDialog,
    resource,
    { refetch },
    { size: 'xl', fullscreen: 'lg-down', contentClassName: 'overflow-auto' },
  );
  return {
    title: translate('Reallocate resource limits'),
    action,
    tooltip,
    disabled,
    iconNode: <ArrowsClockwiseIcon weight="bold" />,
    important: true,
  };
};

export const ReallocateLimitsAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const buttonProps = useReallocateLimits({ resource, refetch });

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  return (resource.plan_uuid || resource.marketplace_plan_uuid) &&
    resource.is_limit_based ? (
    <ActionItem {...buttonProps} {...rest} />
  ) : null;
};
