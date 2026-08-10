import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesSetEndDate,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from './constants';
import { getMarketplaceResourceUuid } from './utils';

const EditResourceEndDateDialog = lazyComponent(() =>
  import('./EditResourceEndDateDialog').then((module) => ({
    default: module.EditResourceEndDateDialog,
  })),
);

export const EditResourceEndDateAction: ActionItemType = ({
  marketplaceResource,
  resource,
  refetch,
}) => {
  const _resource = marketplaceResource || resource;

  const { openDialog } = useModal();
  const user = useUser();

  const resourceUuid = getMarketplaceResourceUuid(_resource);

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

  const hasPrepaidComponents = offering?.components?.some(
    (c) => c.is_prepaid === true,
  );

  const callback = () =>
    openDialog(EditResourceEndDateDialog, {
      resolve: {
        resource: _resource,
        refetch,
        updateEndDate: (uuid, end_date) =>
          marketplaceResourcesSetEndDate({
            path: { uuid },
            body: { end_date },
          }),
      },
    });

  // Setting the date takes this one permission. Everyone else — project
  // managers included — asks via RequestEndDateChangeAction.
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_END_DATE,
      customerId: _resource.customer_uuid,
    })
  ) {
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
      actionId={ResourceAction.EDIT_TERMINATION_DATE}
      resource={_resource}
    />
  );
};
