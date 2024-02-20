import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { GenericPermission } from '@waldur/permissions/types';
import { ActionButton } from '@waldur/table/ActionButton';

const EditUserDialog = lazyComponent(
  () => import('./EditUserDialog'),
  'EditUserDialog',
);

interface EditUserButtonProps {
  permission: GenericPermission;
  refetch;
}

export const EditUserButton: React.FC<EditUserButtonProps> = ({
  permission,
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(EditUserDialog, {
        resolve: {
          permission,
          refetch,
        },
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-pencil"
    />
  );
};
