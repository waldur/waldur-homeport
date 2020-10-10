import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { SetRoutesDialog } from './SetRoutesDialog';

export const SetRoutersButton = ({ router }) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetRoutesDialog, {
        resolve: {
          router,
        },
      }),
    );
  return (
    <ActionButton
      title={translate('Set static routes')}
      icon="fa fa-pencil"
      action={openDialog}
    />
  );
};
