import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesSetEndDate,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

import { ResourceAction } from './constants';

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

  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const resourceUuid = _resource.marketplace_resource_uuid || _resource.uuid;

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
    dispatch(
      openModalDialog(EditResourceEndDateDialog, {
        resolve: {
          resource: _resource,
          refetch,
          updateEndDate: (uuid, end_date) =>
            marketplaceResourcesSetEndDate({
              path: { uuid },
              body: { end_date },
            }),
        },
      }),
    );

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
