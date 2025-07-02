import { CodeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useUser } from '@waldur/workspace/hooks';

const SetBackendIdDialog = lazyComponent(() =>
  import('./SetBackendIdDialog').then((module) => ({
    default: module.SetBackendIdDialog,
  })),
);

export const SetBackendIdAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_BACKEND_ID,
      customerId: resource.customer_uuid,
    })
  ) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Set backend ID')}
      modalComponent={SetBackendIdDialog}
      extraResolve={{ refetch }}
      resource={resource}
      iconNode={<CodeIcon weight="bold" />}
    />
  );
};
