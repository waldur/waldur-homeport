import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { deleteRole, getRoles } from './api';

export const RoleDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the role {name}?',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    await deleteRole(row.uuid);
    ENV.roles = await getRoles();
    refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      disabled={row.users_count > 0}
      tooltip={translate('Users should be revoked before role is removed.')}
      iconNode={<Trash />}
    />
  );
};
