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

export const ReallocateLimitsAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    ReallocateLimitsDialog,
    resource,
    { refetch },
    { size: 'xl', fullscreen: 'lg-down', contentClassName: 'overflow-auto' },
  );

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
    <ActionItem
      title={translate('Reallocate resource limits')}
      action={action}
      tooltip={tooltip}
      disabled={disabled}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      important
      {...rest}
    />
  ) : null;
};
