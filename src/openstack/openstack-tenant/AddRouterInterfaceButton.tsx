import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { OpenStackRouter } from 'waldur-js-client';

import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

import { AddRouterInterfaceDialog } from './AddRouterInterfaceDialog';

export const AddRouterInterfaceButton: ActionItemType<OpenStackRouter> = ({
  resource,
}) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(AddRouterInterfaceDialog, {
        resolve: {
          router: resource,
        },
      }),
    );
  return (
    <ActionItem
      title={translate('Add router interface')}
      iconNode={<PlusCircleIcon weight="bold" />}
      action={openDialog}
    />
  );
};
