import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

const PaymentProfileUpdateDialog = lazyComponent(() =>
  import('./PaymentProfileUpdateDialog').then((module) => ({
    default: module.PaymentProfileUpdateDialog,
  })),
);

export const PaymentProfileEditButton = (props) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(PaymentProfileUpdateDialog, {
      resolve: { profile: props.row, refetch: props.refetch },
    });

  return (
    <EditAction action={callback} {...props.tooltipAndDisabledAttributes} />
  );
};
