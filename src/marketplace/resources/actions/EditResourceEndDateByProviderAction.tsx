import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceProviderResourcesOfferingRetrieve,
  marketplaceProviderResourcesSetEndDate,
  Resource,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { getMarketplaceResourceUuid } from './utils';

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
  const { openDialog } = useModal();
  const user = useUser();

  const resourceUuid = getMarketplaceResourceUuid(resource);

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
    openDialog(EditResourceEndDateDialog, {
      resolve: {
        resource,
        refetch,
        updateEndDate: (uuid, end_date) =>
          marketplaceProviderResourcesSetEndDate({
            path: { uuid },
            body: { end_date },
          }),
      },
    });

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
