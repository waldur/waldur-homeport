import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { SetAllowedAddressPairsDialog } from './SetAllowedAddressPairsDialog';

export const SetAllowedAddressPairsButton = ({ instance, internalIp }) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetAllowedAddressPairsDialog, {
        resolve: {
          instance,
          internalIp,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionButton
      title={translate('Set allowed address pairs')}
      icon="fa fa-pencil"
      action={openDialog}
    />
  );
};
