import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { CustomerUser } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionButton } from '@waldur/table/ActionButton';

const AddProjectUserDialog = lazyComponent(() =>
  import('./AddProjectUserDialog').then((module) => ({
    default: module.AddProjectUserDialog,
  })),
);

interface AddProjectUserButtonProps {
  customer: CustomerUser;
  refetch;
  asDropdownItem?: boolean;
}

export const AddProjectUserButton: React.FC<AddProjectUserButtonProps> = ({
  customer,
  refetch,
  asDropdownItem,
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
  return asDropdownItem ? (
    <ActionItem
      title={translate('Add project role')}
      action={callback}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  ) : (
    <ActionButton
      action={callback}
      title={translate('Add')}
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
