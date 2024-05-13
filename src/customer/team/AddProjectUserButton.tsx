import { PlusCircle } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { NestedCustomerPermission } from './types';

const AddProjectUserDialog = lazyComponent(
  () => import('./AddProjectUserDialog'),
  'AddProjectUserDialog',
);

interface AddProjectUserButtonProps {
  customer: NestedCustomerPermission;
  refetch;
}

export const AddProjectUserButton: React.FC<AddProjectUserButtonProps> = ({
  customer,
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AddProjectUserDialog, {
        resolve: {
          customer,
          refetch,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Add')}
      iconNode={<PlusCircle />}
    />
  );
};
