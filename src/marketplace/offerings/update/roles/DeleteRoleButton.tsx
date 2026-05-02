import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { DeleteRoleDialog } from './DeleteRoleDialog';

export const DeleteRoleAction = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const handler = () => {
    openDialog(DeleteRoleDialog, { resolve: { row, refetch } });
  };
  return <RemovalActionItem title={translate('Delete')} action={handler} />;
};
