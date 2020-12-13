import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingPermissionCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingPermissionCreateDialog" */ './OfferingPermissionCreateDialog'
    ),
  'OfferingPermissionCreateDialog',
);

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
