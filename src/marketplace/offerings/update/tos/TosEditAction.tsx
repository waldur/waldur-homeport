import { PencilIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { TosEditDialog } from './TosEditDialog';

export const TosEditAction = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const handleEdit = () => {
    dispatch(
      openModalDialog(TosEditDialog, {
        resolve: { tos: row, refetch },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleEdit}
      iconNode={<PencilIcon weight="bold" />}
    />
  );
};
