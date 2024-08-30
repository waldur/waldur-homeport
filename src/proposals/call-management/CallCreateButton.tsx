import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CallCreateDialog = lazyComponent(
  () => import('./CallFormDialog'),
  'CallFormDialog',
);

const callCreateDialog = (refetch) =>
  openModalDialog(CallCreateDialog, {
    resolve: { refetch },
    size: 'md',
  });

export const CallCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();

  return <AddButton action={() => dispatch(callCreateDialog(refetch))} />;
};
