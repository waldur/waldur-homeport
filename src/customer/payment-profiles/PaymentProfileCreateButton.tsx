import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const PaymentProfileCreateDialog = lazyComponent(
  () => import('./PaymentProfileCreateDialog'),
  'PaymentProfileCreateDialog',
);

export const PaymentProfileCreateButton = (props) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(PaymentProfileCreateDialog, {
        resolve: {
          refetch: props.refetch,
        },
      }),
    );
  return <AddButton action={openDialog} {...props} />;
};
