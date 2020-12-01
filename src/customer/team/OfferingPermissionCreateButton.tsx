import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { OfferingPermissionCreateDialog } from './OfferingPermissionCreateDialog';

export const OfferingPermissionCreateButton: React.FC = () => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(openModalDialog(OfferingPermissionCreateDialog));
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add user')}
      icon="fa fa-plus"
    />
  );
};
