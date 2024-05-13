import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { editRole, getRoles } from './api';

const RoleEditDialog = lazyComponent(
  () => import('./RoleEditDialog'),
  'RoleEditDialog',
);

export const RoleDescriptionEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openRoleEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleEditDialog, {
          resolve: {
            row,
            isDescriptionForm: true,
          },
          onSubmit: async (formData) => {
            await editRole(row.uuid, formData);
            ENV.roles = await getRoles();
            dispatch(closeModalDialog());
            refetch();
          },
          onCancel: () => {
            dispatch(closeModalDialog());
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionItem
      title={translate('Edit descriptions')}
      iconNode={<PencilSimple />}
      action={openRoleEditDialog}
    />
  );
};
