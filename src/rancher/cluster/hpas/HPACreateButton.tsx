import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { HPACreateDialog } from './HPACreateDialog';

const createHPADialog = (cluster) =>
  openModalDialog(HPACreateDialog, { resolve: { cluster } });

export const HPACreateButton = ({ cluster }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(createHPADialog(cluster));
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      icon="fa fa-plus"
    />
  );
};
