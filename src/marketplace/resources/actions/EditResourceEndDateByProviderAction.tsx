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

import { ResourceAction } from './constants';
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
        pluginOptions: offering?.plugin_options,
        refetch,
        updateEndDate: (uuid, end_date) =>
          marketplaceProviderResourcesSetEndDate({
            path: { uuid },
            body: { end_date },
          }),
      },
    });

  // No support bypass: set_end_date on the provider endpoint takes the
  // permission and nothing else. Only the deprecated set_end_date_by_provider
  // let support through, so offering the entry to support produced a 403.
  const hasPermissionToSet = hasPermission(user, {
    permission: PermissionEnum.SET_RESOURCE_END_DATE,
    customerId: resource.provider_uuid,
  });

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
      // The same capability as EditResourceEndDateAction, so an offering that
      // switches it off through disabled_resource_actions hides this one too.
      actionId={ResourceAction.EDIT_TERMINATION_DATE}
      resource={resource}
    />
  );
};
