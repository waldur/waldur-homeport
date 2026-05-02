import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const RemoteSyncFormDialog = lazyComponent(() =>
  import('./RemoteSyncFormDialog').then((module) => ({
    default: module.RemoteSyncFormDialog,
  })),
);

export const RemoteSyncCreateButton = ({ refetch }) => {
  const { openDialog } = useModal();
  return (
    <AddButton
      action={() =>
        openDialog(RemoteSyncFormDialog, {
          refetch,
          size: 'lg',
        })
      }
    />
  );
};
