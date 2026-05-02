import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

const PaymentProfileUpdateDialogContainer = lazyComponent(() =>
  import('./PaymentProfileUpdateDialog').then((module) => ({
    default: module.PaymentProfileUpdateDialogContainer,
  })),
);

export const PaymentProfileEditButton = (props) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(PaymentProfileUpdateDialogContainer, {
      resolve: { profile: props.row, refetch: props.refetch },
    });

  return (
    <EditAction action={callback} {...props.tooltipAndDisabledAttributes} />
  );
};
