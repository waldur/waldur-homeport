import { PencilIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

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
