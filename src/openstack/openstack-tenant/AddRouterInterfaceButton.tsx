import { PlusCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { OpenStackRouter } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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
