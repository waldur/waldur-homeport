import { ArrowsClockwiseIcon } from '@phosphor-icons/react';

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
