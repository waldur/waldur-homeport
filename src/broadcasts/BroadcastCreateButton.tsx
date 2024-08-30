import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const BroadcastCreateDialog = lazyComponent(
  () => import('./BroadcastCreateDialog'),
  'BroadcastCreateDialog',
);

export const BroadcastCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(BroadcastCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'xl',
      }),
    );
  return <AddButton action={callback} />;
};
