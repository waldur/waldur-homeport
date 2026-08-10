import { CalendarBlankIcon } from '@phosphor-icons/react';

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

const RequestEndDateChangeFlowDialog = lazyComponent(() =>
  import('./RequestEndDateChangeFlowDialog').then((module) => ({
    default: module.RequestEndDateChangeFlowDialog,
  })),
);

const validators = [validateState('OK')];

export const RequestEndDateChangeAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}) => {
  const user = useUser();
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    RequestEndDateChangeFlowDialog,
    resource,
    { refetch },
    { size: 'lg' },
  );

  // Anyone who can change the date themselves uses the ordinary end date
  // dialog; the backend refuses to create a request for them. Project managers
  // are not among them — managing limits does not carry the end date.
  const canChangeDirectly =
    hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_END_DATE,
      customerId: resource.customer_uuid,
    }) ||
    user?.is_staff ||
    user?.is_support;

  const resourceUuid = getMarketplaceResourceUuid(resource);
  const offering = useResourceOffering(resourceUuid, !canChangeDirectly);

  if (canChangeDirectly || !resourceUuid) {
    return null;
  }

  // Only offerings that accept end date change requests have anyone to act on
  // one — elsewhere the request could never be approved.
  if (
    !offering?.plugin_options?.enable_resource_end_date_change_requests ||
    offering.components?.some((component) => component.is_prepaid)
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Request end date change')}
      action={action}
      tooltip={tooltip}
      disabled={disabled}
      iconNode={<CalendarBlankIcon weight="bold" />}
      resource={resource}
      {...rest}
    />
  );
};
