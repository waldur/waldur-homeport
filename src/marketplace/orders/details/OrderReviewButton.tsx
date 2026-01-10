import { lazyComponent } from '@waldur/core/lazyComponent';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

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
