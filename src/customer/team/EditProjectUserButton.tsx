import { PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { CustomerUser, NestedProjectPermission } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const EditProjectUserDialog = lazyComponent(() =>
  import('./EditProjectUserDialog').then((module) => ({
    default: module.EditProjectUserDialog,
  })),
);

interface EditProjectUserButtonProps {
  project: NestedProjectPermission;
  customer: CustomerUser;
  refetch;
}

export const EditProjectUserButton: React.FC<EditProjectUserButtonProps> = ({
  project,
  customer,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(EditProjectUserDialog, {
      resolve: {
        project,
        customer,
        refetch,
      },
    });
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
