import { TimerIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
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

import { ResourceAction } from '../actions/constants';

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

  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  if (!(resource.plan_uuid || resource.marketplace_plan_uuid)) {
    return null;
  }

  // Check if resource has limit-based or prepaid components
  const resourceUuid = resource.marketplace_resource_uuid || resource.uuid;
  const { data: offering } = useQuery({
    queryKey: ['resource-offering', resourceUuid],
    queryFn: () =>
      marketplaceResourcesOfferingRetrieve({
        path: { uuid: resourceUuid },
      }).then((response) => response.data),
    enabled: Boolean(resourceUuid),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const hasEditableComponents = offering?.components?.some(
    (c) => c.billing_type === 'limit' || c.is_prepaid,
  );

  // Show only when offering has limit-based or prepaid components
  if (offering && !hasEditableComponents) {
    return null;
  }

  return <ActionItem {...buttonProps} {...rest} />;
};
