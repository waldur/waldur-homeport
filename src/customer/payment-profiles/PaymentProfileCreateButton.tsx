import { useDispatch } from 'react-redux';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { openModalDialog } from '@/modal/actions';

const PaymentProfileCreateDialog = lazyComponent(() =>
  import('./PaymentProfileCreateDialog').then((module) => ({
    default: module.PaymentProfileCreateDialog,
  })),
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
