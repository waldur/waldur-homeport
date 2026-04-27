import { XIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const MultiDestroyAction = ({ rows, refetch }) => {
  const dispatch = useDispatch();
  const user = useUser();

  const permittedResources = useMemo(
    () =>
      rows.filter(
        (resource) =>
          ['OK', 'ERRED'].includes(resource.state) &&
          !resource.offering_plugin_options?.disabled_resource_actions?.includes(
            ResourceAction.TERMINATE,
          ) &&
          hasPermission(user, {
            permission: PermissionEnum.TERMINATE_RESOURCE,
            projectId: resource.project_uuid,
            customerId: resource.customer_uuid,
          }),
      ),
    [rows, user],
  );

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to destroy {count} resources?', {
          count: permittedResources.length,
        }),
      );
    } catch {
      return;
    }

    Promise.all(
      permittedResources.map((resource) =>
        marketplaceResourcesTerminate({ path: { uuid: resource.uuid } }),
      ),
    ).then(() => {
      refetch();
    });
  }, [dispatch, permittedResources, refetch]);

  if (permittedResources.length === 0) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Destroy')}
      action={callback}
      disabled={permittedResources.length !== rows.length}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
