import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useUser } from '@waldur/workspace/hooks';

const RenewAllocationDialog = lazyComponent(() =>
  import('../renew-allocation/RenewAllocationDialog').then((module) => ({
    default: module.RenewAllocationDialog,
  })),
);

export const MultiRenewAllocationsAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch;
}) => {
  const dispatch = useDispatch();
  const user = useUser();

  const validResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          ['OK'].includes(resource.state) &&
          hasPermission(user, {
            permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
            projectId: resource.project_uuid,
            customerId: resource.customer_uuid,
          }),
      ),
    [rows, user],
  );

  const callback = () =>
    dispatch(
      openModalDialog(RenewAllocationDialog, {
        resolve: {
          resources: validResources,
          refetch,
        },
        size: 'xl',
        fullscreen: 'lg-down',
      }),
    );

  if (!validResources.length) return null;

  return (
    <ActionItem
      title={translate('Renew allocations')}
      action={callback}
      iconNode={<ArrowClockwiseIcon weight="bold" />}
    />
  );
};
