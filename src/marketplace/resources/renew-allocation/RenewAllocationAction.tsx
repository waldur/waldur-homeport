import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

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

const RenewAllocationDialog = lazyComponent(() =>
  import('./RenewAllocationDialog').then((module) => ({
    default: module.RenewAllocationDialog,
  })),
);

const validators = [validateState('OK')];

const useRenewAllocationAction = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  // Check if resource has prepaid components by fetching offering data
  const { data: offering, isLoading } = useQuery({
    queryKey: [
      'resource-offering',
      resource.marketplace_resource_uuid || resource.uuid,
    ],
    queryFn: () =>
      marketplaceResourcesOfferingRetrieve({
        path: { uuid: resource.marketplace_resource_uuid || resource.uuid },
      }).then((response) => response.data),
    enabled: Boolean(resource.marketplace_resource_uuid || resource.uuid),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check if offering has any prepaid components
  const hasPrepaidComponents = offering?.components?.some(
    (component) => component.is_prepaid === true,
  );

  const action = useModalDialogCallback(
    RenewAllocationDialog,
    resource,
    { refetch },
    { size: 'xl', fullscreen: 'lg-down' },
  );

  return {
    title: translate('Renew allocation'),
    action,
    tooltip,
    disabled,
    iconNode: <ArrowClockwiseIcon weight="bold" />,
    important: true,
    // Return prepaid status to be used for concealment decision
    hasPrepaidComponents,
    isLoading,
  };
};

export const RenewAllocationActionAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const buttonProps = useRenewAllocationAction({ resource, refetch });

  // Hide the action if the user lacks UPDATE_RESOURCE_LIMITS permission
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }

  // Only show the action if resource has a plan and resource UUID (needed for prepaid check)
  if (
    !(resource.plan_uuid || resource.marketplace_plan_uuid) ||
    !(resource.marketplace_resource_uuid || resource.uuid)
  ) {
    return null;
  }

  // Conceal the action if still loading or no prepaid components found
  if (buttonProps.isLoading || !buttonProps.hasPrepaidComponents) {
    return null;
  }

  // Remove the prepaid-specific props before passing to ActionItem
  const {
    hasPrepaidComponents: _hasPrepaidComponents,
    isLoading: _isLoading,
    ...actionProps
  } = buttonProps;

  return <ActionItem {...actionProps} {...rest} />;
};
