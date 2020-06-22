import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { HPAUpdateDialog } from './HPAUpdateDialog';

const editHPADialog = (hpa) =>
  openModalDialog(HPAUpdateDialog, { resolve: { hpa } });

export const HPAUpdateButton = ({ hpa }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(editHPADialog(hpa));
  return (
    <ActionButton
      title={translate('Edit')}
      action={callback}
      icon="fa fa-edit"
    />
  );
};
