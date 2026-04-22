import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  marketplaceProviderResourcesOfferingRetrieve,
  marketplaceProviderResourcesSetEndDate,
  Resource,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

const EditResourceEndDateDialog = lazyComponent(() =>
  import('./EditResourceEndDateDialog').then((module) => ({
    default: module.EditResourceEndDateDialog,
  })),
);

interface EditResourceEndDateByProviderActionProps {
  resource: Resource;
  refetch?(): void;
}

export const EditResourceEndDateByProviderAction = ({
  resource,
  refetch,
}: EditResourceEndDateByProviderActionProps) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const resourceUuid =
    (resource as any).marketplace_resource_uuid || resource.uuid;

  const { data: offering } = useQuery({
    queryKey: ['resource-offering', resourceUuid],
    queryFn: () =>
      marketplaceProviderResourcesOfferingRetrieve({
        path: { uuid: resourceUuid },
      }).then((response) => response.data),
    enabled: Boolean(resourceUuid),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const hasPrepaidComponents = offering?.components?.some(
    (c) => c.is_prepaid === true,
  );

  const callback = () =>
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource,
          refetch,
          updateEndDate: (uuid, end_date) =>
            marketplaceProviderResourcesSetEndDate({
              path: { uuid },
              body: { end_date },
            }),
        },
      }),
    );

  const hasPermissionToSet =
    hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_END_DATE,
      customerId: resource.provider_uuid,
    }) || user.is_support;

  if (!hasPermissionToSet) {
    return null;
  }

  // For prepaid resources, only staff can manually change end date
  if (hasPrepaidComponents && !user.is_staff) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Set termination date')}
      action={callback}
      iconNode={<CalendarBlankIcon weight="bold" />}
    />
  );
};
