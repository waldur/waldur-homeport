import { PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { CustomerUser, NestedProjectPermission } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(EditProjectUserDialog, {
        resolve: {
          project,
          customer,
          refetch,
        },
      }),
    );
  return (
    <ActionItem
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
