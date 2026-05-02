import { PencilIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { TosEditDialog } from './TosEditDialog';

export const TosEditAction = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const handleEdit = () => {
    openDialog(TosEditDialog, {
      resolve: { tos: row, refetch },
      size: 'lg',
    });
  };

  return (
    <ActionItem
      title={translate('Edit')}
      action={handleEdit}
      iconNode={<PencilIcon weight="bold" />}
    />
  );
};
