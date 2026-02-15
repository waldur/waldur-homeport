import { useMutation } from '@tanstack/react-query';
import { Stack } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersRejectByProvider,
} from 'waldur-js-client';

import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { FileDownloader } from '@waldur/form/upload/FileDownloader';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

export const OrderReviewDialog = ({ order, loadData }) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const { mutate: rejectOrder } = useMutation({
    mutationFn: async () => {
      let result;
      try {
        result = await waitForConfirmation(
          dispatch,
          translate('Reject order'),
          translate('Are you sure you want to reject this order?'),
          {
            showInput: true,
            inputLabel: translate('Rejection reason (optional)'),
            positiveButton: translate('Reject'),
          },
        );
      } catch {
        return;
      }
      try {
        await marketplaceOrdersRejectByProvider({
          path: { uuid: order.uuid },
          body: { provider_rejection_comment: result?.input },
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
          <CompactSubmitButton
            submitting={false}
            variant="danger"
            className="w-100"
            onClick={() => rejectOrder()}
            type="button"
            label={translate('Reject')}
          />
          <CompactSubmitButton
            submitting={false}
            variant="success"
            className="w-100"
            onClick={() => approveOrder()}
            type="button"
            label={translate('Approve')}
          />
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
