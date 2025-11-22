import { useMutation } from '@tanstack/react-query';
import { Button, Stack } from 'react-bootstrap';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersRejectByProvider,
} from 'waldur-js-client';

import { FileDownloader } from '@waldur/form/upload/FileDownloader';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

export const OrderReviewDialog = ({ order, loadData }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { mutate: rejectOrder } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceOrdersRejectByProvider({
          path: { uuid: order.uuid },
        });
        await loadData();
        showSuccess(translate('Order has been rejected.'));
      } catch (response) {
        showErrorResponse(response, translate('Unable to reject order.'));
      }
    },
  });
  const { mutate: approveOrder } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceOrdersApproveByProvider({
          path: { uuid: order.uuid },
        });
        await loadData();
        showSuccess(translate('Order has been approved.'));
      } catch (response) {
        showErrorResponse(response, translate('Unable to approve order.'));
      }
    },
  });

  return (
    <ModalDialog
      title={translate('Review submitted PDF')}
      subtitle={translate(
        'The customer has submitted this signed Purchase Order for your review.',
      )}
      footer={
        <>
          <CloseDialogButton className="min-w-125px" />
          <Button
            className="btn-success btn-sm w-100"
            onClick={() => rejectOrder()}
          >
            {translate('Reject')}
          </Button>
          <Button
            className="btn-danger btn-sm w-100"
            onClick={() => approveOrder()}
          >
            {translate('Approve')}
          </Button>
        </>
      }
    >
      <Stack>
        <strong>{translate('PO reference')}</strong>
        {order.request_comment}
      </Stack>
      {translate('Purchase order')}
      <FileDownloader url={order.attachment} name={translate('PDF file')} />
    </ModalDialog>
  );
};
