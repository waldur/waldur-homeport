import { CodeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from './actions/constants';

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
      customerId: resource.provider_uuid,
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
      actionId={ResourceAction.UPDATE_BACKEND_ID}
    />
  );
};
