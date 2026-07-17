import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

const EditResourceMetadataDialog = lazyComponent(() =>
  import('./EditResourceMetadataDialog').then((module) => ({
    default: module.EditResourceMetadataDialog,
  })),
);

export const EditResourceMetadataAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  const user = useUser();
  // set_endpoints and set_backend_metadata are both gated by this permission on
  // the offering's customer (the provider), so one check covers the dialog.
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SET_RESOURCE_BACKEND_METADATA,
      customerId: resource.provider_uuid,
    })
  ) {
    return null;
  }
  return (
    <DialogActionItem
      title={translate('Edit metadata')}
      modalComponent={EditResourceMetadataDialog}
      extraResolve={{ refetch }}
      resource={resource}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
