import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { useModal } from '@/modal/actions';

const CustomerCreditDialog = lazyComponent(() =>
  import('./CustomerCreditDialog').then((module) => ({
    default: module.CustomerCreditDialog,
  })),
);

export const CreateCreditButton = ({ refetch }) => {
  const { openDialog } = useModal();

  return (
    <AddButton
      action={() =>
        openDialog(CustomerCreditDialog, {
          size: 'lg',
          resolve: { refetch },
        })
      }
    />
  );
};
