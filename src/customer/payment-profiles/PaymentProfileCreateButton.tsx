import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const PaymentProfileCreateDialog = lazyComponent(() =>
  import('./PaymentProfileCreateDialog').then((module) => ({
    default: module.PaymentProfileCreateDialog,
  })),
);

export const PaymentProfileCreateButton = (props) => {
  const { openDialog: openModal } = useModal();
  const openDialog = () =>
    openModal(PaymentProfileCreateDialog, {
      resolve: {
        refetch: props.refetch,
      },
    });
  return <AddButton action={openDialog} {...props} />;
};
