import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { RoleModifyRequest, rolesUpdate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { closeModalDialog, openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { getRoles } from './utils';

const RoleFormDialog = lazyComponent(() =>
  import('./RoleFormDialog').then((module) => ({
    default: module.RoleFormDialog,
  })),
);

export const RoleEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openRoleEditDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleFormDialog, {
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
    [dispatch, row, refetch],
  );

  return (
    <ActionItem
      title={translate('Edit role')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openRoleEditDialog}
    />
  );
};
