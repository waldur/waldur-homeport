import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { checkScope } from '@waldur/permissions/hasPermission';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

import { Resource } from './types';

const SetBackendIdDialog = lazyComponent(
  () => import('./SetBackendIdDialog'),
  'SetBackendIdDialog',
);

export const SetBackendIdAction: ActionItemType = ({
  resource,
  refetch,
}: {
  resource: Resource;
  refetch;
}) => {
  const user = useSelector(getUser);
  if (
    !checkScope(
      user,
      'customer',
      resource.provider_uuid,
      PermissionEnum.SET_RESOURCE_BACKEND_ID,
    ) &&
    !checkScope(
      user,
      'offering',
      resource.offering_uuid,
      PermissionEnum.SET_RESOURCE_BACKEND_ID,
    )
  ) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ refetch }}
      resource={resource}
    />
  );
};
