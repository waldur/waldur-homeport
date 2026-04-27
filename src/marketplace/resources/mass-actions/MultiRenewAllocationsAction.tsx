import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

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
