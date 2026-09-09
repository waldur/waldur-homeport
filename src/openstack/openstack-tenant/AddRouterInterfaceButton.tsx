import { PlusCircleIcon } from '@phosphor-icons/react';
import { OpenStackRouter } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { AddRouterInterfaceDialog } from './AddRouterInterfaceDialog';

export const AddRouterInterfaceButton: ActionItemType<OpenStackRouter> = ({
  resource,
  refetch,
}) => {
  const { openDialog: openModal } = useModal();
  const openDialog = () =>
    openModal(AddRouterInterfaceDialog, {
      resolve: {
        router: resource,
        // Without this the new interface -- and the fixed IP it adds to the
        // router -- stays invisible until the page is reloaded.
        refetch,
      },
    });
  return (
    <ActionItem
      title={translate('Add router interface')}
      iconNode={<PlusCircleIcon weight="bold" />}
      action={openDialog}
    />
  );
};
