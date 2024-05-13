import { PencilSimple } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { NestedCustomerPermission, NestedProjectPermission } from './types';

const EditProjectUserDialog = lazyComponent(
  () => import('./EditProjectUserDialog'),
  'EditProjectUserDialog',
);

interface EditProjectUserButtonProps {
  project: NestedProjectPermission;
  customer: NestedCustomerPermission;
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
    <ActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
    />
  );
};
