import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { DeleteRoleDialog } from './DeleteRoleDialog';

export const DeleteRoleAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const handler = () => {
    dispatch(openModalDialog(DeleteRoleDialog, { resolve: { row, refetch } }));
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};
