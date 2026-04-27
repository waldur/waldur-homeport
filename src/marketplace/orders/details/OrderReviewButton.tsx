import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';

const OrderReviewDialog = lazyComponent(() =>
  import('./OrderReviewDialog').then((module) => ({
    default: module.OrderReviewDialog,
  })),
);

export const OrderReviewButton = ({ order, loadData }) => {
  const { openDialog } = useModal();

  return (
    <SubmitButton
      submitting={false}
      type="button"
      variant="tertiary"
      onClick={() =>
        openDialog(OrderReviewDialog, {
          size: 'lg',
          order,
          loadData,
        })
      }
      label={translate('Review PDF')}
    />
  );
};
