import { useDispatch } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const RemoteSyncFormDialog = lazyComponent(() =>
  import('./RemoteSyncFormDialog').then((module) => ({
    default: module.RemoteSyncFormDialog,
  })),
);

export const RemoteSyncCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  return (
    <AddButton
      action={() =>
        dispatch(
          openModalDialog(RemoteSyncFormDialog, {
            refetch,
            size: 'lg',
          }),
        )
      }
    />
  );
};
