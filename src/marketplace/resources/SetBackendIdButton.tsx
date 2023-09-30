import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const SetBackendIdDialog = lazyComponent(
  () => import('./SetBackendIdDialog'),
  'SetBackendIdDialog',
);

export const SetBackendIdButton: FC<any> = ({ resource, refetch }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const isServiceProviderContext = resource.provider_uuid === customer.uuid;
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_BACKEND_ID,
      customerId: customer.uuid,
    }) &&
    !isServiceProviderContext
  ) {
    return null;
  }
  return (
    <DialogActionButton
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ refetch }}
      resource={resource}
    />
  );
};
