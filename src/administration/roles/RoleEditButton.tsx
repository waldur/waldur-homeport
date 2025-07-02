import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { RoleModifyRequest, rolesUpdate } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { getRoles } from './utils';

const RoleEditDialog = lazyComponent(() =>
  import('./RoleEditDialog').then((module) => ({
    default: module.RoleEditDialog,
  })),
);

export const RoleEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openRoleEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleEditDialog, {
          resolve: {
            row,
          },
          submitFn: async (formData: RoleModifyRequest) => {
            await rolesUpdate({ path: { uuid: row.uuid }, body: formData });
            ENV.roles = await getRoles();
            dispatch(closeModalDialog());
            refetch();
          },
        }),
      ),
    [dispatch],
  );

  return (
    <ActionItem
      title={translate('Edit role')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openRoleEditDialog}
    />
  );
};
