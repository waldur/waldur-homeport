import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const QuickShortcutFormDialog = lazyComponent(() =>
  import('./QuickShortcutForm').then((module) => ({
    default: module.QuickShortcutForm,
  })),
);

export const QuickShortcutEditAction: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(QuickShortcutFormDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { shortcut: row, refetch },
        size: 'lg',
      }),
    );
  };
  return <EditAction action={callback} size="sm" />;
};
