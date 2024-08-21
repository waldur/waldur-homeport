import { Wrench } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { getUser } from '@waldur/workspace/selectors';

const SetBackendIdDialog = lazyComponent(
  () => import('./SetBackendIdDialog'),
  'SetBackendIdDialog',
);

export const SetBackendIdButton: FC<{ row; refetch }> = ({ row, refetch }) => {
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_BACKEND_ID,
      customerId: row.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <DialogActionButton
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ refetch }}
      resource={row}
      actionItem
      iconNode={<Wrench />}
    />
  );
};
