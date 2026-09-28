import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const OrderReviewDialog = lazyComponent(() =>
  import('./OrderReviewDialog').then((module) => ({
    default: module.OrderReviewDialog,
  })),
);

export const OrderReviewButton = ({ order, loadData }) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      variant="tertiary"
      onClick={() =>
        openDialog(OrderReviewDialog, {
          size: 'lg',
          order,
          loadData,
        })
      }
      label={translate('Review PDF')}
      size="lg"
    />
  );
};
