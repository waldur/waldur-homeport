import { Button } from 'react-bootstrap';

import { lazyComponent } from '@waldur/core/lazyComponent';
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
    <Button
      variant="tertiary"
      onClick={() =>
        openDialog(OrderReviewDialog, {
          size: 'lg',
          order,
          loadData,
        })
      }
    >
      {translate('Review PDF')}
    </Button>
  );
};
