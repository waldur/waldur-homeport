import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';
import { CustomerUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';

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
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(AddProjectUserDialog, {
      resolve: {
        customer,
        refetch,
      },
    });
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
