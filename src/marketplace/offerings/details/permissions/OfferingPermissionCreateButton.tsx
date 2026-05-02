import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingPermissionCreateDialog = lazyComponent(() =>
  import('./OfferingPermissionCreateDialog').then((module) => ({
    default: module.OfferingPermissionCreateDialog,
  })),
);

export const OfferingPermissionCreateButton: React.FC<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OfferingPermissionCreateDialog, {
      resolve: { offering, refetch },
    });
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add user')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
